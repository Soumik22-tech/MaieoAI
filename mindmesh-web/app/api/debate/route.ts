import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { saveDebate } from '@/lib/debates';

const PYTHON_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { query } = await req.json();
  if (!query?.trim()) {
    return NextResponse.json({ message: 'Query is required' }, { status: 400 });
  }

  // Call the Python FastAPI backend
  const backendRes = await fetch(`${PYTHON_API}/debate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!backendRes.ok) {
    const err = await backendRes.json().catch(() => ({}));
    return NextResponse.json(
      { message: err.error || 'Debate backend failed' },
      { status: backendRes.status }
    );
  }

  const result = await backendRes.json();

  // Persist to Neon DB
  try {
    const saved = await saveDebate(userId, query, result);
    return NextResponse.json({ ...result, _db_id: saved.id, _share_id: saved.share_id });
  } catch (dbErr) {
    // If DB save fails, still return the result (graceful degradation)
    console.error('DB save failed:', dbErr);
    return NextResponse.json(result);
  }
}
