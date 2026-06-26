import { count, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys, users } from '@/db/schema';
import { deleteAwsApiKey } from '@/lib/aws-gateway';
import { DEMO_MODE, deleteDemoUser, getDemoAdminUsers } from '@/lib/demo';
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
      return NextResponse.json({ users: getDemoAdminUsers() });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        phoneNumber: true,
        name: true,
        status: true,
        createdAt: true,
        approvedAt: true,
      },
    });

    // Count API keys for each user
    const usersWithKeyCounts = await Promise.all(
      allUsers.map(async (user) => {
        const keyCount = await db
          .select({ count: count(apiKeys) })
          .from(apiKeys)
          .where(eq(apiKeys.userId, user.id));
        return {
          ...user,
          apiKeyCount: keyCount[0]?.count || 0,
        };
      }),
    );

    return NextResponse.json({ users: usersWithKeyCounts });
  } catch (error) {
    console.error('Get users error:', error);
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

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (DEMO_MODE) {
      deleteDemoUser(userId);
      return NextResponse.json({ success: true, message: 'User deleted (demo)' });
    }

    // Fetch user keys to delete them from AWS first
    const userKeys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.userId, userId),
    });

    for (const key of userKeys) {
      try {
        await deleteAwsApiKey(key.awsKeyId);
      } catch (err) {
        console.error(`Failed to delete AWS key ${key.awsKeyId} for user ${userId}:`, err);
      }
    }

    // Delete user from DB (cascades to apiKeys, etc.)
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
