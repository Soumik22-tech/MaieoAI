import axios from 'axios';
import { DebateResult } from '../types/debate';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function runDebate(query: string): Promise<DebateResult> {
  const response = await fetch('/api/debate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Debate failed');
  }
  return response.json();
}

export async function getHistory() {
  const response = await fetch('/api/history');
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
}

export async function deleteSavedDebate(id: string) {
  const response = await fetch(`/api/history/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete debate');
  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
