import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { status } = body; // 'pending' | 'paid' | 'waived'
  const dbStatus = status.toUpperCase();

  if (dbStatus === 'PAID') {
    await pool.query(
      "UPDATE fines SET status = 'PAID', paid_date = CURDATE() WHERE fine_id = ?",
      [params.id]
    );
  } else {
    await pool.query('UPDATE fines SET status = ?, paid_date = NULL WHERE fine_id = ?', [
      dbStatus,
      params.id,
    ]);
  }
  return NextResponse.json({ ok: true });
}
