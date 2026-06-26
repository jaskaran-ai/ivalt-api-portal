process.env.NEXT_PUBLIC_DEMO_MODE = 'true';

import { beforeEach, describe, expect, mock, test } from 'bun:test';

const mockGetSession = mock<() => unknown>();
const mockDeleteDemoUser = mock<() => void>();
const mockDeleteDemoAccessRequest = mock<() => void>();
const mockDeleteDemoKey = mock<() => void>();
const mockToggleDemoKey = mock<() => void>();

mock.module('@/lib/session', () => ({ getSession: mockGetSession }));
mock.module('@/lib/demo', () => ({
  DEMO_MODE: true,
  getDemoAdminUsers: () => [],
  getDemoAdminKeys: () => [],
  deleteDemoUser: mockDeleteDemoUser,
  deleteDemoAccessRequest: mockDeleteDemoAccessRequest,
  deleteDemoKey: mockDeleteDemoKey,
  toggleDemoKey: mockToggleDemoKey,
}));

describe('Admin Actions (demo mode)', () => {
  beforeEach(() => {
    mockGetSession.mockReturnValue({
      userId: 'admin-user',
      isLoggedIn: true,
      role: 'admin',
    });
    mockDeleteDemoUser.mockReset();
    mockDeleteDemoAccessRequest.mockReset();
    mockDeleteDemoKey.mockReset();
    mockToggleDemoKey.mockReset();
  });

  describe('DELETE /api/admin/users', () => {
    async function deleteUser(body: unknown) {
      const { DELETE } = await import('@/app/api/admin/users/route');
      const req = new Request('http://localhost/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return DELETE(req as any);
    }

    test('returns 401 if not authorized', async () => {
      mockGetSession.mockReturnValue({ isLoggedIn: false });
      const res = await deleteUser({ userId: 'u1' });
      expect(res.status).toBe(401);
    });

    test('returns 400 if userId missing', async () => {
      const res = await deleteUser({});
      expect(res.status).toBe(400);
    });

    test('deletes user successfully', async () => {
      const res = await deleteUser({ userId: 'u1' });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(mockDeleteDemoUser).toHaveBeenCalledWith('u1');
    });
  });

  describe('DELETE /api/access/approve', () => {
    async function deleteRequest(body: unknown) {
      const { DELETE } = await import('@/app/api/access/approve/route');
      const req = new Request('http://localhost/api/access/approve', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return DELETE(req as any);
    }

    test('returns 401 if not authorized', async () => {
      mockGetSession.mockReturnValue({ isLoggedIn: false });
      const res = await deleteRequest({ requestId: 'r1' });
      expect(res.status).toBe(401);
    });

    test('returns 400 if requestId missing', async () => {
      const res = await deleteRequest({});
      expect(res.status).toBe(400);
    });

    test('deletes request successfully', async () => {
      const res = await deleteRequest({ requestId: 'r1' });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(mockDeleteDemoAccessRequest).toHaveBeenCalledWith('r1');
    });
  });

  describe('Admin Key Actions', () => {
    async function deleteKey(body: unknown) {
      const { DELETE } = await import('@/app/api/admin/keys/route');
      const req = new Request('http://localhost/api/admin/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return DELETE(req as any);
    }

    async function patchKey(body: unknown) {
      const { PATCH } = await import('@/app/api/admin/keys/route');
      const req = new Request('http://localhost/api/admin/keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return PATCH(req as any);
    }

    test('deletes key successfully', async () => {
      const res = await deleteKey({ keyId: 'k1' });
      expect(res.status).toBe(200);
      expect(mockDeleteDemoKey).toHaveBeenCalledWith('k1');
    });

    test('toggles key successfully', async () => {
      const res = await patchKey({ keyId: 'k1', isActive: false });
      expect(res.status).toBe(200);
      expect(mockToggleDemoKey).toHaveBeenCalledWith('k1', false);
    });
  });
});
