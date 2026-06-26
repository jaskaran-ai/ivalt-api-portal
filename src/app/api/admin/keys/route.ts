import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { deleteAwsApiKey, toggleAwsApiKey } from '@/lib/aws-gateway';
import { DEMO_MODE, deleteDemoKey, getDemoAdminKeys, toggleDemoKey } from '@/lib/demo';
import { getSession } from '@/lib/session';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    const isAdmin = !!(session.isLoggedIn && (DEMO_MODE || session.role === 'admin'));
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      return NextResponse.json({ keys: getDemoAdminKeys() });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const allKeys = await db.query.apiKeys.findMany({
      with: {
        user: {
          columns: {
            id: true,
            phoneNumber: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // Add usage counts (you could integrate with actual usage tracking here)
    const keysWithUsage = allKeys.map((key) => ({
      id: key.id,
      keyName: key.keyName,
      awsKeyId: key.awsKeyId,
      keyValue: null, // Never expose the actual key value
      isActive: key.isActive,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
      usageCount: 0, // Would come from actual usage tracking
      user: key.user
        ? {
            id: key.user.id,
            phoneNumber: key.user.phoneNumber,
            name: key.user.name,
            status: key.user.status,
          }
        : null,
    }));

    return NextResponse.json({ keys: keysWithUsage });
  } catch (error) {
    console.error('Get keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    const isAdmin = !!(session.isLoggedIn && (DEMO_MODE || session.role === 'admin'));
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keyId, isActive } = await req.json();
    if (!keyId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    if (DEMO_MODE) {
      toggleDemoKey(keyId, isActive);
      const updated = getDemoAdminKeys().find((k) => k.id === keyId);
      return NextResponse.json({ key: updated, success: true, demo: true });
    }

    const key = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.id, keyId),
    });

    if (!key) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    try {
      await toggleAwsApiKey(key.awsKeyId, isActive);
    } catch (err) {
      console.error('AWS toggle error:', err);
    }

    const [updated] = await db
      .update(apiKeys)
      .set({ isActive })
      .where(eq(apiKeys.id, keyId))
      .returning();

    return NextResponse.json({ key: updated, success: true });
  } catch (error) {
    console.error('Patch admin key error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const isAdmin = !!(session.isLoggedIn && (DEMO_MODE || session.role === 'admin'));
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keyId } = await req.json();
    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    if (DEMO_MODE) {
      deleteDemoKey(keyId);
      return NextResponse.json({ success: true, demo: true });
    }

    const key = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.id, keyId),
    });

    if (!key) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    try {
      await deleteAwsApiKey(key.awsKeyId);
    } catch (err) {
      console.error('AWS delete key error:', err);
    }

    await db.delete(apiKeys).where(eq(apiKeys.id, keyId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete admin key error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
