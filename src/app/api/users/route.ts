import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

function mapUser(r: RowDataPacket) {
  return {
    id: String(r.user_id),
    name: r.name,
    email: r.email ?? '',
    role: 'user' as const,
    avatar: r.avatar ?? '',
    phone: r.phone ?? '',
    joinDate: r.created_at
      ? new Date(r.created_at).toISOString().slice(0, 10)
      : '',
    status: r.status === 'SUSPENDED' ? 'suspended' : 'active',
    borrowedCount: Number(r.borrowed_count ?? 0),
  };
}

export async function GET() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.*,
            (SELECT COUNT(*) FROM borrow_records br
             WHERE br.user_id = u.user_id AND br.status IN ('BORROWED','LATE')) AS borrowed_count
     FROM users u
     ORDER BY u.user_id`
  );
  return NextResponse.json(rows.map(mapUser));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, password, address } = body;
  if (!name || (!email && !phone)) {
    return NextResponse.json(
      { error: 'name and at least one of email/phone are required' },
      { status: 400 }
    );
  }
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (name, email, phone, password, address) VALUES (?, ?, ?, ?, ?)',
    [name, email ?? null, phone ?? null, password ?? 'password123', address ?? '']
  );
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT *, 0 AS borrowed_count FROM users WHERE user_id = ?',
    [result.insertId]
  );
  return NextResponse.json(mapUser(rows[0]));
}
