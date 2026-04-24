import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserDebates } from '@/lib/debates';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const debates = await getUserDebates(userId);
  return NextResponse.json(debates);
}
