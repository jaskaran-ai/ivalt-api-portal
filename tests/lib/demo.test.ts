import { describe, expect, test } from 'bun:test';
import {
  addDemoKey,
  DEMO_ACCESS_REQUESTS,
  DEMO_API_KEYS,
  DEMO_MODE,
  DEMO_SESSION,
  DEMO_USERS,
  deleteDemoKey,
  getDemoAccessRequests,
  getDemoAdminKeys,
  getDemoAdminUsage,
  getDemoAdminUsers,
  getDemoKeys,
  getDemoUser,
  toggleDemoKey,
} from '@/lib/demo';

describe('DEMO_MODE', () => {
  test('is false by default', () => {
    expect(DEMO_MODE).toBe(false);
  });
});

describe('DEMO_USERS', () => {
  test('has 16 users', () => {
    expect(DEMO_USERS).toHaveLength(16);
  });

  test('each user has required fields', () => {
    for (const user of DEMO_USERS) {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('phoneNumber');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('status');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
      expect(user).toHaveProperty('lastLoginAt');
    }
  });

  test('covers all statuses', () => {
    const statuses = DEMO_USERS.map((u) => u.status);
    expect(statuses).toContain('approved');
    expect(statuses).toContain('pending');
    expect(statuses).toContain('rejected');
  });

  test('has unique phone numbers', () => {
    const phones = DEMO_USERS.map((u) => u.phoneNumber);
    expect(new Set(phones).size).toBe(phones.length);
  });
});

describe('getDemoUser', () => {
  test('finds user by phone number', () => {
    const user = getDemoUser('+919876543210');
    expect(user).toBeDefined();
    expect(user?.name).toBe('Jaskaran (Approved)');
  });

  test('returns undefined for unknown number', () => {
    const user = getDemoUser('+919999999999');
    expect(user).toBeUndefined();
  });
});

describe('DEMO_SESSION', () => {
  test('references the first approved user', () => {
    expect(DEMO_SESSION.userId).toBe(DEMO_USERS[0].id);
    expect(DEMO_SESSION.phoneNumber).toBe(DEMO_USERS[0].phoneNumber);
    expect(DEMO_SESSION.isLoggedIn).toBe(true);
    expect(DEMO_SESSION.accessStatus).toBe('approved');
  });
});

describe('DEMO_API_KEYS', () => {
  test('has 13 keys', () => {
    expect(DEMO_API_KEYS).toHaveLength(13);
  });

  test('first keys belong to first user', () => {
    expect(DEMO_API_KEYS[0].userId).toBe(DEMO_USERS[0].id);
    expect(DEMO_API_KEYS[1].userId).toBe(DEMO_USERS[0].id);
    expect(DEMO_API_KEYS[2].userId).toBe(DEMO_USERS[0].id);
  });

  test('includes active and inactive keys', () => {
    const active = DEMO_API_KEYS.filter((k) => k.isActive);
    const inactive = DEMO_API_KEYS.filter((k) => !k.isActive);
    expect(active.length).toBeGreaterThan(0);
    expect(inactive.length).toBeGreaterThan(0);
  });
});

describe('DEMO_ACCESS_REQUESTS', () => {
  test('has 12 requests', () => {
    expect(DEMO_ACCESS_REQUESTS).toHaveLength(12);
  });

  test('includes pending and approved requests', () => {
    const pending = DEMO_ACCESS_REQUESTS.filter((r) => !r.approvedAt);
    const approved = DEMO_ACCESS_REQUESTS.filter((r) => r.approvedAt);
    expect(pending.length).toBeGreaterThan(0);
    expect(approved.length).toBeGreaterThan(0);
  });
});

describe('getDemoAdminUsers', () => {
  test('returns users with apiKeyCount', () => {
    const result = getDemoAdminUsers();
    expect(result).toHaveLength(16);
    for (const user of result) {
      expect(user).toHaveProperty('apiKeyCount');
      expect(typeof user.apiKeyCount).toBe('number');
    }
  });

  test('first user has 3 keys', () => {
    const result = getDemoAdminUsers();
    expect(result[0].apiKeyCount).toBe(3);
  });

  test('other users have 0 keys', () => {
    const result = getDemoAdminUsers();
    expect(result[1].apiKeyCount).toBe(0);
    expect(result[2].apiKeyCount).toBe(0);
  });

  test('iso strings for dates', () => {
    const result = getDemoAdminUsers();
    expect(() => new Date(result[0].createdAt)).not.toThrow();
  });

  test('approvedAt is null for non-approved users', () => {
    const result = getDemoAdminUsers();
    const pending = result.find((u) => u.status === 'pending');
    expect(pending?.approvedAt).toBeNull();
    const rejected = result.find((u) => u.status === 'rejected');
    expect(rejected?.approvedAt).toBeNull();
  });

  test('approvedAt is set for approved users', () => {
    const result = getDemoAdminUsers();
    const approved = result.find((u) => u.status === 'approved');
    expect(approved?.approvedAt).not.toBeNull();
  });
});

describe('getDemoAdminKeys', () => {
  test('returns all keys with user info', () => {
    const result = getDemoAdminKeys();
    expect(result).toHaveLength(DEMO_API_KEYS.length);

    for (const key of result) {
      expect(key.keyValue).toBeNull();
      expect(key.user).not.toBeNull();
    }
  });

  test('usage counts are numbers', () => {
    const result = getDemoAdminKeys();
    for (const key of result) {
      expect(typeof key.usageCount).toBe('number');
    }
  });

  test('first key has highest usage', () => {
    const result = getDemoAdminKeys();
    expect(result[0].usageCount).toBeGreaterThan(result[1].usageCount);
  });
});

describe('getDemoAdminUsage', () => {
  test('returns usage array and summary', () => {
    const result = getDemoAdminUsage();
    expect(result).toHaveProperty('usage');
    expect(result).toHaveProperty('summary');
  });

  test('summary has correct structure', () => {
    const { summary } = getDemoAdminUsage();
    expect(summary).toHaveProperty('totalUsers', 16);
    expect(summary).toHaveProperty('totalKeys', DEMO_API_KEYS.length);
    expect(summary).toHaveProperty('activeKeys');
    expect(summary).toHaveProperty('inactiveKeys');
    expect(summary).toHaveProperty('recentlyUsed');
    expect(summary).toHaveProperty('totalRequests');
  });

  test('active + inactive = total', () => {
    const { summary } = getDemoAdminUsage();
    expect(summary.activeKeys + summary.inactiveKeys).toBe(summary.totalKeys);
  });
});

describe('getDemoAccessRequests', () => {
  test('returns serialized requests with user', () => {
    const result = getDemoAccessRequests();
    expect(result).toHaveLength(DEMO_ACCESS_REQUESTS.length);

    for (const req of result) {
      expect(typeof req.requestedAt).toBe('string');
      expect(req.user).toBeDefined();
      expect(req.user).toHaveProperty('phoneNumber');
    }
  });

  test('pending requests have null approvedAt', () => {
    const result = getDemoAccessRequests();
    const pending = result.find((r) => r.id === 'demo-req-001');
    expect(pending?.approvedAt).toBeNull();
  });
});

describe('demo key CRUD', () => {
  test('addDemoKey prepends a key', () => {
    const before = getDemoKeys().length;
    const newKey = { ...DEMO_API_KEYS[0], id: 'test-add-key' };
    addDemoKey(newKey);
    expect(getDemoKeys()).toHaveLength(before + 1);
    expect(getDemoKeys()[0].id).toBe('test-add-key');
    deleteDemoKey('test-add-key');
    expect(getDemoKeys()).toHaveLength(before);
  });

  test('deleteDemoKey removes by id', () => {
    const before = getDemoKeys().length;
    addDemoKey({ ...DEMO_API_KEYS[0], id: 'test-del-key' });
    expect(getDemoKeys()).toHaveLength(before + 1);

    deleteDemoKey('test-del-key');
    expect(getDemoKeys()).toHaveLength(before);
  });

  test('toggleDemoKey flips isActive', () => {
    const key = getDemoKeys()[0];
    const before = key.isActive;

    toggleDemoKey(key.id, !before);
    expect(getDemoKeys()[0].isActive).toBe(!before);

    toggleDemoKey(key.id, before);
    expect(getDemoKeys()[0].isActive).toBe(before);
  });
});
