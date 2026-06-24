import { describe, test, expect, mock } from "bun:test";

// Mock next/headers before importing session
const mockCookieGet = mock<(name: string) => { value: string } | undefined>();

mock.module("next/headers", () => ({
  cookies: async () => ({
    get: mockCookieGet,
  }),
}));

// Mock iron-session
mock.module("iron-session", () => ({
  getIronSession: async () => ({
    userId: "iron-user-id",
    phoneNumber: "+919876543210",
    isLoggedIn: true,
    accessStatus: "approved",
    save: async () => {},
    destroy: () => {},
  }),
  SessionOptions: class {},
}));

// Set demo mode so we can test the demo path
process.env.NEXT_PUBLIC_DEMO_MODE = "true";

const { getSession, sessionOptions } = await import("@/lib/session");

describe("getSession (demo mode)", () => {
  test("returns demo session when no cookie set", async () => {
    mockCookieGet.mockReturnValue(undefined);

    const session = await getSession();

    expect(session.isLoggedIn).toBe(true);
    expect(session.accessStatus).toBe("approved");
    expect(session.userId).toBeDefined();
    expect(session.phoneNumber).toBeDefined();
    expect(session.save).toBeDefined();
    expect(session.destroy).toBeDefined();
  });

  test("returns user session when demo_user cookie matches", async () => {
    mockCookieGet.mockReturnValue({ value: "+919876543210" });

    const session = await getSession();

    expect(session.isLoggedIn).toBe(true);
    expect(session.phoneNumber).toBe("+919876543210");
    expect(session.userId).toBe("demo-user-approved");
    expect(session.accessStatus).toBe("approved");
  });

  test("returns demo session for unknown cookie user", async () => {
    mockCookieGet.mockReturnValue({ value: "+919999999999" });

    const session = await getSession();

    expect(session.isLoggedIn).toBe(true);
    expect(session.userId).toBeDefined();
    expect(session.phoneNumber).not.toBe("+919999999999");
  });
});

describe("sessionOptions", () => {
  test("has required config", () => {
    expect(sessionOptions.cookieName).toBe("ivalt_portal_session");
    expect(sessionOptions.password).toBeDefined();
    expect(sessionOptions.cookieOptions).toBeDefined();
    expect(sessionOptions.cookieOptions?.httpOnly).toBe(true);
    expect(sessionOptions.cookieOptions?.sameSite).toBe("lax");
  });
});
