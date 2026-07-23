import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { status } = body; // 'active' | 'suspended'
  await pool.query('UPDATE users SET status = ? WHERE user_id = ?', [
    status === 'suspended' ? 'SUSPENDED' : 'ACTIVE',
    params.id,
  ]);
  return NextResponse.json({ ok: true });
}
