import { redirect } from 'next/navigation';
import { DEMO_MODE } from '@/lib/demo';
import { getSession } from '@/lib/session';

export default async function Home() {
  if (DEMO_MODE) {
    redirect('/login');
  }
  const session = await getSession();
  if (session.isLoggedIn) {
    redirect('/dashboard');
  }
  redirect('/login');
}
