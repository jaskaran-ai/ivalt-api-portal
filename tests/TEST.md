# Tests

## Running

```bash
bun test              # all tests
bun test tests/lib/   # unit tests only
bun test tests/api/   # route handler tests only
bun test --filter demo # by filename pattern
```

## Structure

Tests mirror `src/` layout under `tests/`:

| File                              | What it tests                                             | Type          |
| --------------------------------- | --------------------------------------------------------- | ------------- |
| `lib/demo.test.ts`                | Demo data integrity, getters, CRUD                        | unit          |
| `lib/ivalt.test.ts`               | iVALT auth request/result with mocked HTTP                | unit          |
| `lib/session.test.ts`             | Session cookie lookup, demo fallback, iron-session config | unit          |
| `lib/aws-gateway.test.ts`         | AWS API Gateway key CRUD (mocked SDK)                     | unit          |
| `api/keys/create.demo.test.ts`    | POST `/api/keys/create` in demo mode                      | route handler |
| `api/keys/create.prod.test.ts`    | POST `/api/keys/create` in production mode                | route handler |
| `api/access/approve.demo.test.ts` | POST/GET `/api/access/approve` in demo mode               | route handler |
| `api/access/approve.prod.test.ts` | POST `/api/access/approve` in production mode             | route handler |

## Pattern

All tests use **Bun's built-in test runner** (`bun test`) — no Jest/Vitest needed. Imports are resolved via `@/` path aliases automatically.

**Unit tests** mock external deps with `mock.module()` at the file top-level:

```ts
mock.module("@aws-sdk/client-api-gateway", () => ({
  APIGatewayClient: class {
    send = mockSend;
  },
  CreateApiKeyCommand: class {
    constructor(public input: unknown) {}
  },
}));
```

**Route handler tests** create a `Request` and call the exported handler directly:

```ts
const { POST } = await import("@/app/api/keys/create/route");
const req = new Request("http://localhost/api/keys/create", {
  method: "POST",
  body: JSON.stringify({ keyName: "My Key" }),
});
const res = await POST(req as any);
expect(res.status).toBe(200);
```

## Caveats

- `mock.module()` is **process-wide** in Bun. Files that need different `DEMO_MODE` values are split into separate files (e.g., `create.demo.test.ts` vs `create.prod.test.ts`) — they can never coexist in the same file or process.
- Route handler tests use `as any` cast on `Request` → `NextRequest` — `NextRequest` has extra properties (cookies, nextUrl) that aren't needed for the subset of APIs tested.
