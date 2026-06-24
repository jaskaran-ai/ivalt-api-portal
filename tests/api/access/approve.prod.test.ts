process.env.NEXT_PUBLIC_DEMO_MODE = "false";

import { describe, test, expect, mock, beforeEach } from "bun:test";

const mockGetSession = mock<() => unknown>();
const mockFindAccessRequest = mock<() => unknown>();
const mockFindUser = mock<() => unknown>();
const mockSendApprovedEmail = mock<() => unknown>();
const mockSendRejectedEmail = mock<() => unknown>();
let mockUpdateCalledWith: unknown = null;

mock.module("@/lib/session", () => ({ getSession: mockGetSession }));
mock.module("@/lib/demo", () => ({
  DEMO_MODE: false,
  getDemoAccessRequests: () => [],
}));

mock.module("@/lib/email", () => ({
  sendUserApprovedEmail: mockSendApprovedEmail,
  sendUserRejectedEmail: mockSendRejectedEmail,
}));

mock.module("@/db/schema", () => ({
  users: { id: "users.id" },
  accessRequests: { id: "accessRequests.id", approvedAt: "accessRequests.approvedAt" },
}));

mock.module("drizzle-orm", () => ({
  eq: (a: unknown, b: unknown) => ({ op: "eq", a, b }),
  and: (...args: unknown[]) => ({ op: "and", args }),
  isNull: (a: unknown) => ({ op: "isNull", a }),
  isNotNull: (a: unknown) => ({ op: "isNotNull", a }),
  or: (...args: unknown[]) => ({ op: "or", args }),
}));

mock.module("@/db", () => ({
  db: {
    query: {
      accessRequests: { findFirst: mockFindAccessRequest },
      users: { findFirst: mockFindUser },
    },
    update: () => ({
      set: (data: unknown) => {
        mockUpdateCalledWith = data;
        return { where: () => Promise.resolve() };
      },
    }),
  },
}));

describe("POST /api/access/approve (production mode)", () => {
  beforeEach(() => {
    mockFindAccessRequest.mockReset();
    mockFindUser.mockReset();
    mockSendApprovedEmail.mockReset();
    mockSendRejectedEmail.mockReset();
    mockUpdateCalledWith = null;

    mockFindAccessRequest.mockReturnValue({
      id: "req-123",
      userId: "user-456",
      approvedAt: null,
    });
    mockFindUser.mockReturnValue({
      id: "user-456",
      phoneNumber: "+919876543210",
      name: "Test User",
    });
  });

  async function post(body: unknown) {
    const { POST } = await import("@/app/api/access/approve/route");
    const req = new Request("http://localhost/api/access/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return POST(req as any);
  }

  test("returns 400 if requestId missing", async () => {
    const res = await post({ approved: true });
    expect(res.status).toBe(400);
  });

  test("returns 404 if request not found", async () => {
    mockFindAccessRequest.mockReturnValue(null);
    const res = await post({ requestId: "nonexistent", approved: true });
    expect(res.status).toBe(404);
  });

  test("approves request and sends email", async () => {
    const res = await post({ requestId: "req-123", approved: true, adminNotes: "Looks good" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("approved");
    expect(mockSendApprovedEmail).toHaveBeenCalledTimes(1);
    expect(mockSendRejectedEmail).not.toHaveBeenCalled();
  });

  test("rejects request and sends rejection email", async () => {
    const res = await post({ requestId: "req-123", approved: false, adminNotes: "Incomplete" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("rejected");
    expect(mockSendRejectedEmail).toHaveBeenCalledTimes(1);
    expect(mockSendApprovedEmail).not.toHaveBeenCalled();
  });
});
