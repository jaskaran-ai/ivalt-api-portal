import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { DEMO_MODE } from '@/lib/demo';
import { getSession } from '@/lib/session';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      return NextResponse.json({
        status: session.accessStatus || 'pending',
        request: null,
      });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (user && user.status !== session.accessStatus) {
      session.accessStatus = user.status as 'pending' | 'approved' | 'rejected';
      await session.save?.();
    }

    const request = await db.query.accessRequests.findFirst({
      where: (ar) => eq(ar.userId, userId),
    });

    // Return the user's status - if no user record, they need to complete access request
    return NextResponse.json({
      status: user?.status || 'pending',
      request: request || null,
    });
  } catch (error) {
    console.error('Get access status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
