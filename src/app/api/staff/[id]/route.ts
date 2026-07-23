import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { status } = body; // 'active' | 'inactive'
  await pool.query('UPDATE staff SET status = ? WHERE staff_id = ?', [
    status === 'inactive' ? 'INACTIVE' : 'ACTIVE',
    params.id,
  ]);
  return NextResponse.json({ ok: true });
}
