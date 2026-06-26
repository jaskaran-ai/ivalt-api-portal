import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { accessRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DEMO_MODE } from '@/lib/demo';
import AccessStatusClient from '@/components/access/AccessStatusClient';

export default async function AccessStatusPage() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect('/login');
  }

  if (session.accessStatus === 'approved') {
    redirect('/dashboard');
  } else if (session.accessStatus === 'pending' && !DEMO_MODE) {
    const request = await db.query.accessRequests.findFirst({
      where: eq(accessRequests.userId, session.userId),
    });
    if (!request?.useCase || request.useCase.trim() === '') {
      redirect('/access/request');
    }
  }

  return <AccessStatusClient />;
}
