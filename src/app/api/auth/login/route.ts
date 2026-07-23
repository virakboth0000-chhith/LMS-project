import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, role } = body as { email: string; password: string; role: string };

  if (!email || !role) {
    return NextResponse.json({ error: 'email and role are required' }, { status: 400 });
  }

  if (role === 'admin' || role === 'librarian') {
    const dbRole = role === 'admin' ? 'ADMIN' : 'LIBRARIAN';
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM staff WHERE email = ? AND role = ?',
      [email, dbRole]
    );
    const staff = rows[0];
    // NOTE: demo-grade plain-text comparison. Hash passwords (bcrypt) for real use.
    if (!staff || (password && staff.password !== password)) {
      return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });
    }
    return NextResponse.json({
      id: String(staff.staff_id),
      name: staff.name,
      email: staff.email,
      role,
      avatar: staff.avatar ?? '',
      phone: staff.phone ?? '',
      joinDate: staff.created_at ? new Date(staff.created_at).toISOString().slice(0, 10) : '',
      status: 'active',
      borrowedCount: 0,
    });
  }

  // role === 'user'
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [
    email,
  ]);
  const user = rows[0];
  if (!user || (password && user.password !== password)) {
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });
  }
  return NextResponse.json({
    id: String(user.user_id),
    name: user.name,
    email: user.email,
    role: 'user',
    avatar: user.avatar ?? '',
    phone: user.phone ?? '',
    joinDate: user.created_at ? new Date(user.created_at).toISOString().slice(0, 10) : '',
    status: user.status === 'SUSPENDED' ? 'suspended' : 'active',
    borrowedCount: 0,
  });
}
