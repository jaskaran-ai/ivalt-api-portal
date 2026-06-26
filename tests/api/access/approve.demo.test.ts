process.env.NEXT_PUBLIC_DEMO_MODE = 'true';

import { describe, expect, mock, test } from 'bun:test';

mock.module('@/lib/demo', () => ({
  DEMO_MODE: true,
  getDemoAccessRequests: () => [{ id: 'req-1', userId: 'user-1', approvedAt: null }],
}));

describe('POST /api/access/approve (demo mode)', () => {
  async function post(body: unknown) {
    const { POST } = await import('@/app/api/access/approve/route');
    const req = new Request('http://localhost/api/access/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return POST(req as any);
  }

  test('returns success in demo mode', async () => {
    const res = await post({ requestId: 'req-1', approved: true });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain('demo');
  });
});

describe('GET /api/access/approve (demo mode)', () => {
  async function get(status?: string) {
    const { GET } = await import('@/app/api/access/approve/route');
    const url = status
      ? `http://localhost/api/access/approve?status=${status}`
      : 'http://localhost/api/access/approve';
    const req = new Request(url);
    return GET(req as any);
  }

  test('returns filtered requests in demo mode', async () => {
    const res = await get('all');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.requests).toHaveLength(1);
  });
});
