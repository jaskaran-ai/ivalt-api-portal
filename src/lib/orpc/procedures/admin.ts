import { and, count, eq, isNotNull, isNull, like, or, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { accessRequests, apiKeys, users } from '@/db/schema';
import { DEMO_MODE } from '@/lib/demo';
import { base, type PaginatedResult, paginatedResponse, paginationSchema } from '..';

// ── Shared response schemas ──────────────────────────────────────────────────

const AdminUserSchema = z.object({
  id: z.string(),
  phoneNumber: z.string(),
  name: z.string().nullable(),
  status: z.string(),
  createdAt: z.string(),
  approvedAt: z.string().nullable(),
  apiKeyCount: z.number(),
});

const AdminKeyUserSchema = z.object({
  id: z.string(),
  phoneNumber: z.string(),
  name: z.string().nullable(),
  status: z.string(),
});

const AdminKeySchema = z.object({
  id: z.string(),
  keyName: z.string(),
  awsKeyId: z.string(),
  keyValue: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  lastUsedAt: z.string().nullable(),
  usageCount: z.number(),
  user: AdminKeyUserSchema.nullable(),
});

const AccessRequestUserSchema = z.object({
  id: z.string(),
  phoneNumber: z.string(),
  name: z.string().nullable(),
});

const AccessRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  useCase: z.string(),
  requestedAt: z.string(),
  approvedAt: z.string().nullable(),
  adminNotes: z.string().nullable(),
  user: AccessRequestUserSchema.nullable(),
});

// ── Procedures ────────────────────────────────────────────────────────────────

export const listAdminUsers = base
  .input(
    paginationSchema.extend({
      status: z.enum(['all', 'approved', 'pending', 'rejected']).default('all'),
    }),
  )
  .handler(async ({ input }): Promise<PaginatedResult<z.infer<typeof AdminUserSchema>>> => {
    if (DEMO_MODE) {
      const { getDemoAdminUsers } = await import('@/lib/demo');
      const all = getDemoAdminUsers() as z.infer<typeof AdminUserSchema>[];
      const filtered = input.status === 'all' ? all : all.filter((u) => u.status === input.status);
      const start = (input.page - 1) * input.perPage;
      return paginatedResponse(
        filtered.slice(start, start + input.perPage),
        filtered.length,
        input.page,
        input.perPage,
      );
    }

    const offset = (input.page - 1) * input.perPage;

    const whereClause = input.status === 'all' ? undefined : eq(users.status, input.status);

    const [{ count: total }] = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause ?? undefined);

    const rows = await db.query.users.findMany({
      columns: {
        id: true,
        phoneNumber: true,
        name: true,
        status: true,
        createdAt: true,
        approvedAt: true,
      },
      where: whereClause,
      limit: input.perPage,
      offset,
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });

    const items = await Promise.all(
      rows.map(async (user) => {
        const [keyCount] = await db
          .select({ count: count() })
          .from(apiKeys)
          .where(eq(apiKeys.userId, user.id));
        return {
          ...user,
          createdAt: user.createdAt.toISOString(),
          approvedAt: user.approvedAt?.toISOString() ?? null,
          apiKeyCount: keyCount?.count ?? 0,
        };
      }),
    );

    return paginatedResponse(items, total, input.page, input.perPage);
  });

export const listAdminKeys = base
  .input(
    paginationSchema.extend({
      status: z.enum(['all', 'active', 'inactive']).default('all'),
      search: z.string().optional(),
    }),
  )
  .handler(async ({ input }): Promise<PaginatedResult<z.infer<typeof AdminKeySchema>>> => {
    if (DEMO_MODE) {
      const { getDemoAdminKeys } = await import('@/lib/demo');
      const all = getDemoAdminKeys() as z.infer<typeof AdminKeySchema>[];
      let filtered = all;
      if (input.status === 'active') filtered = filtered.filter((k) => k.isActive);
      if (input.status === 'inactive') filtered = filtered.filter((k) => !k.isActive);
      if (input.search) {
        const q = input.search.toLowerCase();
        filtered = filtered.filter(
          (k) =>
            k.keyName.toLowerCase().includes(q) ||
            k.awsKeyId.toLowerCase().includes(q) ||
            k.user?.name?.toLowerCase().includes(q),
        );
      }
      const start = (input.page - 1) * input.perPage;
      return paginatedResponse(
        filtered.slice(start, start + input.perPage),
        filtered.length,
        input.page,
        input.perPage,
      );
    }

    const offset = (input.page - 1) * input.perPage;

    const conditions: (SQL | undefined)[] = [];
    if (input.status === 'active') conditions.push(eq(apiKeys.isActive, true));
    if (input.status === 'inactive') conditions.push(eq(apiKeys.isActive, false));
    if (input.search) {
      const q = `%${input.search}%`;
      conditions.push(
        // Search on keyName, awsKeyId — user name search via join is handled in query
        or(like(apiKeys.keyName, q), like(apiKeys.awsKeyId, q)),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ count: total }] = await db
      .select({ count: count() })
      .from(apiKeys)
      .where(whereClause ?? undefined);

    const rows = await db.query.apiKeys.findMany({
      with: {
        user: {
          columns: { id: true, phoneNumber: true, name: true, status: true },
        },
      },
      where: whereClause,
      limit: input.perPage,
      offset,
      orderBy: (k, { desc }) => [desc(k.createdAt)],
    });

    const items = rows.map((key) => ({
      id: key.id,
      keyName: key.keyName,
      awsKeyId: key.awsKeyId,
      keyValue: null,
      isActive: key.isActive,
      createdAt: key.createdAt.toISOString(),
      lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
      usageCount: 0,
      user: key.user
        ? {
            id: key.user.id,
            phoneNumber: key.user.phoneNumber,
            name: key.user.name,
            status: key.user.status,
          }
        : null,
    }));

    return paginatedResponse(items, total, input.page, input.perPage);
  });

export const listAccessRequests = base
  .input(
    paginationSchema.extend({
      status: z.enum(['all', 'pending', 'approved']).default('pending'),
    }),
  )
  .handler(async ({ input }): Promise<PaginatedResult<z.infer<typeof AccessRequestSchema>>> => {
    if (DEMO_MODE) {
      const { getDemoAccessRequests } = await import('@/lib/demo');
      const all = getDemoAccessRequests() as z.infer<typeof AccessRequestSchema>[];
      const filtered =
        input.status === 'all'
          ? all
          : input.status === 'pending'
            ? all.filter((r) => !r.approvedAt)
            : all.filter((r) => r.approvedAt);
      const start = (input.page - 1) * input.perPage;
      return paginatedResponse(
        filtered.slice(start, start + input.perPage),
        filtered.length,
        input.page,
        input.perPage,
      );
    }

    const offset = (input.page - 1) * input.perPage;

    const whereClause =
      input.status === 'all'
        ? undefined
        : input.status === 'pending'
          ? isNull(accessRequests.approvedAt)
          : isNotNull(accessRequests.approvedAt);

    const [{ count: total }] = await db
      .select({ count: count() })
      .from(accessRequests)
      .where(whereClause ?? undefined);

    const rows = await db.query.accessRequests.findMany({
      where: whereClause,
      limit: input.perPage,
      offset,
      orderBy: (r, { desc }) => [desc(r.requestedAt)],
    });

    const items = await Promise.all(
      rows.map(async (req) => {
        const found = req.userId
          ? await db.query.users.findFirst({
              where: eq(users.id, req.userId),
              columns: { id: true, phoneNumber: true, name: true },
            })
          : null;
        const user = found
          ? { id: found.id, phoneNumber: found.phoneNumber, name: found.name }
          : null;
        return {
          id: req.id,
          userId: req.userId,
          useCase: req.useCase,
          requestedAt: req.requestedAt.toISOString(),
          approvedAt: req.approvedAt?.toISOString() ?? null,
          adminNotes: req.adminNotes,
          user,
        };
      }),
    );

    return paginatedResponse(items, total, input.page, input.perPage);
  });
