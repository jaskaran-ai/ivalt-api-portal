import { afterEach, describe, expect, test } from 'bun:test';
import { getBiometricResult, sendBiometricAuthRequest } from '@/lib/ivalt';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(status: number, body?: unknown) {
  globalThis.fetch = async () =>
    new Response(body ? JSON.stringify(body) : null, {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
}

function mockFetchError() {
  globalThis.fetch = async () => {
    throw new Error('Network error');
  };
}

describe('sendBiometricAuthRequest', () => {
  test('returns success on 200', async () => {
    mockFetch(200);
    const result = await sendBiometricAuthRequest('+919876543210');
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
  });

  test('returns user-not-found on 404', async () => {
    mockFetch(404);
    const result = await sendBiometricAuthRequest('+919999999999');
    expect(result.success).toBe(false);
    expect(result.message).toContain('not found');
    expect(result.statusCode).toBe(404);
  });

  test('returns failure on 500', async () => {
    mockFetch(500);
    const result = await sendBiometricAuthRequest('+919876543210');
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(500);
  });

  test('handles network errors gracefully', async () => {
    mockFetchError();
    const result = await sendBiometricAuthRequest('+919876543210');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Network error');
    expect(result.statusCode).toBe(0);
  });
});

describe('getBiometricResult', () => {
  test('returns authenticated on 200', async () => {
    mockFetch(200, { user: 'test' });
    const result = await getBiometricResult('+919876543210');
    expect(result.status).toBe('authenticated');
    expect(result.statusCode).toBe(200);
    expect(result.data).toBeDefined();
  });

  test('returns pending on 422', async () => {
    mockFetch(422);
    const result = await getBiometricResult('+919876543210');
    expect(result.status).toBe('pending');
    expect(result.statusCode).toBe(422);
  });

  test('returns failed on 403', async () => {
    mockFetch(403);
    const result = await getBiometricResult('+919876543210');
    expect(result.status).toBe('failed');
    expect(result.statusCode).toBe(403);
  });

  test('returns not_found on 404', async () => {
    mockFetch(404);
    const result = await getBiometricResult('+919876543210');
    expect(result.status).toBe('not_found');
    expect(result.statusCode).toBe(404);
  });

  test('returns failed on unknown status codes', async () => {
    mockFetch(429);
    const result = await getBiometricResult('+919876543210');
    expect(result.status).toBe('failed');
    expect(result.statusCode).toBe(429);
  });

  test('handles network errors gracefully', async () => {
    mockFetchError();
    const result = await getBiometricResult('+919876543210');
    expect(result.status).toBe('failed');
    expect(result.statusCode).toBe(0);
  });

  test('handles 200 with no JSON body', async () => {
    globalThis.fetch = async () => new Response('not json', { status: 200 });
    const result = await getBiometricResult('+919876543210');
    expect(result.status).toBe('authenticated');
    expect(result.data).toEqual({});
  });
});
