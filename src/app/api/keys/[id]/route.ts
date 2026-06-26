import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { deleteAwsApiKey, toggleAwsApiKey } from '@/lib/aws-gateway';
import { DEMO_MODE, deleteDemoKey, getDemoKeys, toggleDemoKey } from '@/lib/demo';
import { getSession } from '@/lib/session';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  if (DEMO_MODE) {
    const keys = getDemoKeys();
    const key = keys.find((k) => k.id === id);
    if (!key) return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    return NextResponse.json({ keyValue: key.keyValue });
  }

  const key = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.id, id), eq(apiKeys.userId, session.userId)),
  });

  if (!key) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  return NextResponse.json({ keyValue: key.keyValue || '' });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // ── DEMO MODE ───────────────────────────────────────────────────────────────
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 400));
    deleteDemoKey(id);
    return NextResponse.json({ success: true, demo: true });
  }
  // ────────────────────────────────────────────────────────────────────────────

  const key = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.id, id), eq(apiKeys.userId, session.userId)),
  });

  if (!key) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  try {
    await deleteAwsApiKey(key.awsKeyId);
  } catch (error) {
    console.error('AWS delete error (continuing):', error);
  }

  await db.delete(apiKeys).where(eq(apiKeys.id, id));
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { isActive } = await req.json();

  // ── DEMO MODE ───────────────────────────────────────────────────────────────
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    toggleDemoKey(id, isActive);
    const updated = getDemoKeys().find((k) => k.id === id);
    return NextResponse.json({ key: updated, demo: true });
  }
  // ────────────────────────────────────────────────────────────────────────────

  const key = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.id, id), eq(apiKeys.userId, session.userId)),
  });

  if (!key) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  try {
    await toggleAwsApiKey(key.awsKeyId, isActive);
  } catch (error) {
    console.error('AWS toggle error:', error);
  }

  const [updated] = await db
    .update(apiKeys)
    .set({ isActive })
    .where(eq(apiKeys.id, id))
    .returning();

  return NextResponse.json({ key: updated });
}
