process.env.NEXT_PUBLIC_DEMO_MODE = "false";

import { describe, test, expect, mock, beforeEach } from "bun:test";

const mockGetSession = mock<() => unknown>();
const mockCreateAwsApiKey = mock<() => unknown>();
const mockUserFindFirst = mock<() => unknown>();
const mockApiKeyFindFirst = mock<() => unknown>();
let mockKeyCount = 0;

mock.module("@/lib/session", () => ({ getSession: mockGetSession }));

mock.module("@/lib/demo", () => ({
  DEMO_MODE: false,
  DEMO_USERS: [],
  getDemoKeys: () => [],
  addDemoKey: () => {},
}));

mock.module("@/lib/aws-gateway", () => ({
  createAwsApiKey: mockCreateAwsApiKey,
}));

mock.module("@/db", () => ({
  db: {
    query: {
      users: { findFirst: mockUserFindFirst },
      apiKeys: { findFirst: mockApiKeyFindFirst },
    },
    select: () => ({
      from: () => ({
        where: () => [{ value: mockKeyCount }],
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: () => [{ id: "db-key-id", keyName: "My Key", awsKeyId: "aws-key-123" }],
      }),
    }),
  },
}));

mock.module("@/db/schema", () => ({
  apiKeys: { userId: "apiKeys.userId" },
  users: { id: "users.id" },
}));

mock.module("drizzle-orm", () => ({
  eq: (a: unknown, b: unknown) => ({ a, b }),
  and: (...args: unknown[]) => ({ op: "and", args }),
  count: () => "count",
}));

describe("POST /api/keys/create (production mode)", () => {
  beforeEach(() => {
    mockGetSession.mockReturnValue({
      userId: "prod-user",
      phoneNumber: "+919876543210",
      isLoggedIn: true,
    });
    mockKeyCount = 0;
    mockUserFindFirst.mockReturnValue({
      name: "Test User",
      phoneNumber: "+919876543210",
    });
    mockApiKeyFindFirst.mockReturnValue(null);
    mockCreateAwsApiKey.mockReturnValue({
      id: "aws-key-123",
      name: "ivalt-portal-prod-user-key",
      value: "raw-api-key-value",
      enabled: true,
    });
  });

  async function post(body: unknown) {
    const { POST } = await import("@/app/api/keys/create/route");
    const req = new Request("http://localhost/api/keys/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return POST(req as any);
  }

  test("returns 401 if not logged in", async () => {
    mockGetSession.mockReturnValue({ isLoggedIn: false });
    const res = await post({ keyName: "My Key" });
    expect(res.status).toBe(401);
  });

  test("returns 400 if key name too short", async () => {
    const res = await post({ keyName: "AB" });
    expect(res.status).toBe(400);
  });

  test("returns 403 if max keys reached", async () => {
    mockKeyCount = 4;
    const res = await post({ keyName: "My Key" });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("maximum");
  });

  test("returns 409 if key name already exists", async () => {
    mockApiKeyFindFirst.mockReturnValue({ id: "existing", keyName: "My Key" });
    const res = await post({ keyName: "My Key" });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("already have a key");
  });

  test("creates key with AWS and stores in DB", async () => {
    const res = await post({ keyName: "My Key" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.key).toBeDefined();
    expect(body.message).toContain("Save it now");
  });
});
