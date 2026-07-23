import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

function mapFine(r: RowDataPacket) {
  return {
    id: String(r.fine_id),
    userId: String(r.user_id),
    userName: r.user_name,
    borrowId: String(r.borrow_id),
    bookTitle: r.title,
    amount: Number(r.amount),
    reason: r.reason ?? '',
    status: r.status.toLowerCase() as 'pending' | 'paid' | 'waived',
    issuedDate:
      r.issued_date instanceof Date ? r.issued_date.toISOString().slice(0, 10) : r.issued_date,
    paidDate: r.paid_date
      ? r.paid_date instanceof Date
        ? r.paid_date.toISOString().slice(0, 10)
        : r.paid_date
      : undefined,
  };
}

const JOIN_SQL = `
  SELECT f.*, br.user_id, u.name AS user_name, b.title
  FROM fines f
  JOIN borrow_records br ON br.borrow_id = f.borrow_id
  JOIN users u ON u.user_id = br.user_id
  JOIN books b ON b.book_id = br.book_id
`;

export async function GET() {
  const [rows] = await pool.query<RowDataPacket[]>(`${JOIN_SQL} ORDER BY f.fine_id DESC`);
  return NextResponse.json(rows.map(mapFine));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { borrowId, amount, reason } = body;

  if (!borrowId || !amount) {
    return NextResponse.json({ error: 'borrowId and amount are required' }, { status: 400 });
  }

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO fines (borrow_id, amount, reason, status, issued_date)
     VALUES (?, ?, ?, 'PENDING', CURDATE())`,
    [borrowId, amount, reason ?? '']
  );

  const [rows] = await pool.query<RowDataPacket[]>(`${JOIN_SQL} WHERE f.fine_id = ?`, [
    result.insertId,
  ]);
  return NextResponse.json(mapFine(rows[0]));
}
