import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { name, description } = body;
  await pool.query(
    'UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?',
    [name, description ?? '', params.id]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await pool.query('DELETE FROM categories WHERE category_id = ?', [params.id]);
  return NextResponse.json({ ok: true });
}
