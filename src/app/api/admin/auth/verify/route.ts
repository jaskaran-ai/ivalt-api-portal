import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { DEMO_MODE } from '@/lib/demo';
import { getBiometricResult } from '@/lib/ivalt';
import { getSession } from '@/lib/session';

const ADMIN_PHONE = '+919530654704';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const cleanPhone = phoneNumber.replace(/\s/g, '');

    if (cleanPhone !== ADMIN_PHONE) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (DEMO_MODE) {
      const session = await getSession();
      session.userId = 'admin-demo';
      session.phoneNumber = cleanPhone;
      session.isLoggedIn = true;
      session.accessStatus = 'approved';
      session.role = 'admin';
      await session.save?.();
      return NextResponse.json({ status: 'authenticated', role: 'admin' });
    }

    const result = await getBiometricResult(cleanPhone);

    if (result.status === 'authenticated') {
      let user = await db.query.users.findFirst({
        where: eq(users.phoneNumber, cleanPhone),
      });

      if (!user) {
        const [newUser] = await db
          .insert(users)
          .values({ phoneNumber: cleanPhone, status: 'approved', role: 'admin' })
          .returning();
        user = newUser;
      } else {
        await db
          .update(users)
          .set({ role: 'admin', lastLoginAt: new Date(), updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }

      const session = await getSession();
      session.userId = user.id;
      session.phoneNumber = cleanPhone;
      session.isLoggedIn = true;
      session.accessStatus = 'approved';
      session.role = 'admin';
      await session.save?.();

      return NextResponse.json({ status: 'authenticated', role: 'admin' });
    }

    return NextResponse.json({ status: result.status, statusCode: result.statusCode });
  } catch (error) {
    console.error('Admin verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
