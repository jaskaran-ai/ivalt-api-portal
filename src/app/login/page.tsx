import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { accessRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DEMO_MODE } from '@/lib/demo';
import LoginClient from '@/components/auth/LoginClient';

export default async function LoginPage() {
  if (!DEMO_MODE) {
    const session = await getSession();
    if (session.isLoggedIn && session.userId) {
      if (session.accessStatus === 'approved') {
        redirect('/dashboard');
      } else if (session.accessStatus === 'rejected') {
        redirect('/access/status');
      } else if (session.accessStatus === 'pending') {
        const request = await db.query.accessRequests.findFirst({
          where: eq(accessRequests.userId, session.userId),
        });
        if (request?.useCase && request.useCase.trim() !== '') {
          redirect('/access/status');
        } else {
          redirect('/access/request');
        }
      }
    }
  }

  return <LoginClient />;
}
