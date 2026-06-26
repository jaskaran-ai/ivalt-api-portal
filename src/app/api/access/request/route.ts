import { eq, isNotNull, isNull } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accessRequests, users } from '@/db/schema';
import { DEMO_MODE } from '@/lib/demo';
import { sendAdminNotification } from '@/lib/email';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { useCase } = await req.json();

    if (!useCase || typeof useCase !== 'string') {
      return NextResponse.json({ error: 'Use case is required' }, { status: 400 });
    }

    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      return NextResponse.json({ success: true, message: 'Access request submitted (demo)' });
    }
    // ──────────────────────────────────────────────────────────────────────────

    // Check if user already has a pending request
    const existingRequest = await db.query.accessRequests.findFirst({
      where: (ar) => eq(ar.userId, userId),
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          error: 'Access request already submitted. Please wait for admin approval.',
          existing: true,
        },
        { status: 400 },
      );
    }

    // Create access request
    await db.insert(accessRequests).values({
      userId,
      useCase,
      requestedAt: new Date(),
    });

    // Update user status to pending
    await db.update(users).set({ status: 'pending' }).where(eq(users.id, userId));

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (user) {
      await sendAdminNotification({
        userName: user.name || 'User',
        userPhone: user.phoneNumber,
        useCase,
      });
    }

    return NextResponse.json({ success: true, message: 'Access request submitted successfully' });
  } catch (error) {
    console.error('Access request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      return NextResponse.json({ requests: [] });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    // Get all access requests with user info
    let requests: (typeof accessRequests.$inferSelect)[] = [];

    if (status === 'all') {
      requests = await db.query.accessRequests.findMany({});
    } else if (status === 'pending') {
      requests = await db.query.accessRequests.findMany({
        where: isNull(accessRequests.approvedAt),
      });
    } else {
      requests = await db.query.accessRequests.findMany({
        where: isNotNull(accessRequests.approvedAt),
      });
    }

    // For each request, get user info
    const requestsWithUsers = await Promise.all(
      requests.map(async (req) => {
        const user = await db.query.users.findFirst({
          where: eq(users.id, req.userId),
        });
        return {
          ...req,
          user: user
            ? { id: user.id, phoneNumber: user.phoneNumber, name: user.name, status: user.status }
            : null,
        };
      }),
    );

    return NextResponse.json({ requests: requestsWithUsers });
  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
