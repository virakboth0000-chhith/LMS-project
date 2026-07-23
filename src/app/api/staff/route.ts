import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

function mapStaff(r: RowDataPacket) {
  return {
    id: String(r.staff_id),
    name: r.name,
    email: r.email ?? '',
    role: r.role === 'ASSISTANT' ? 'assistant' : 'librarian',
    phone: r.phone ?? '',
    department: r.department ?? '',
    joinDate: r.created_at
      ? new Date(r.created_at).toISOString().slice(0, 10)
      : '',
    status: r.status === 'INACTIVE' ? 'inactive' : 'active',
    avatar: r.avatar ?? '',
  };
}

export async function GET() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM staff WHERE role IN ('LIBRARIAN','ASSISTANT') ORDER BY staff_id`
  );
  return NextResponse.json(rows.map(mapStaff));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, password, role, department } = body;
  if (!name || (!email && !phone)) {
    return NextResponse.json(
      { error: 'name and at least one of email/phone are required' },
      { status: 400 }
    );
  }
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO staff (name, email, phone, password, role, department) VALUES (?, ?, ?, ?, ?, ?)',
    [
      name,
      email ?? null,
      phone ?? null,
      password ?? 'password123',
      role === 'assistant' ? 'ASSISTANT' : 'LIBRARIAN',
      department ?? '',
    ]
  );
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM staff WHERE staff_id = ?', [
    result.insertId,
  ]);
  return NextResponse.json(mapStaff(rows[0]));
}
