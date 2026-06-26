process.env.NEXT_PUBLIC_DEMO_MODE = 'true';

import { beforeEach, describe, expect, mock, test } from 'bun:test';

const mockGetSession = mock<() => unknown>();
const mockAddDemoKey = mock<() => void>();
let mockDemoKeys: unknown[] = [];

mock.module('@/lib/session', () => ({ getSession: mockGetSession }));
mock.module('@/lib/demo', () => ({
  DEMO_MODE: true,
  getDemoKeys: () => mockDemoKeys,
  addDemoKey: mockAddDemoKey,
  DEMO_USERS: [{ id: 'demo-user', phoneNumber: '+919876543210' }],
}));

describe('POST /api/keys/create (demo mode)', () => {
  beforeEach(() => {
    mockGetSession.mockReturnValue({
      userId: 'demo-user',
      phoneNumber: '+919876543210',
      isLoggedIn: true,
    });
    mockDemoKeys = [];
    mockAddDemoKey.mockReset();
  });

  async function post(body: unknown) {
    const { POST } = await import('@/app/api/keys/create/route');
    const req = new Request('http://localhost/api/keys/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return POST(req as any);
  }

  test('returns 401 if not logged in', async () => {
    mockGetSession.mockReturnValue({ isLoggedIn: false });
    const res = await post({ keyName: 'My Key' });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('returns 400 if key name too short', async () => {
    const res = await post({ keyName: 'AB' });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('3 characters');
  });

  test('returns 400 if key name missing', async () => {
    const res = await post({});
    expect(res.status).toBe(400);
  });

  test('returns 403 if max keys reached', async () => {
    mockDemoKeys = [{ id: 'k1' }, { id: 'k2' }, { id: 'k3' }, { id: 'k4' }];
    const res = await post({ keyName: 'My Key' });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('maximum');
  });

  test('creates key successfully', async () => {
    const res = await post({ keyName: 'My Test Key' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.key.keyName).toBe('My Test Key');
    expect(body.key.keyValue).toContain('ivalt_demo');
    expect(body.demo).toBe(true);
    expect(mockAddDemoKey).toHaveBeenCalledTimes(1);
  });
});
