import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { RowDataPacket } from 'mysql2';

function mapReturn(r: RowDataPacket) {
  const conditionMap: Record<string, 'good' | 'damaged' | 'lost'> = {
    GOOD: 'good',
    DAMAGED: 'damaged',
    LOST: 'lost',
  };
  return {
    id: String(r.return_id),
    borrowId: String(r.borrow_id),
    userId: String(r.user_id),
    userName: r.user_name,
    bookId: String(r.book_id),
    bookTitle: r.title,
    returnDate:
      r.return_date instanceof Date ? r.return_date.toISOString().slice(0, 10) : r.return_date,
    condition: conditionMap[r.book_condition] ?? 'good',
    librarianId: r.received_by ? String(r.received_by) : '',
    librarianName: r.librarian_name ?? '',
    notes: r.condition_note ?? '',
  };
}

const JOIN_SQL = `
  SELECT rr.*, br.user_id, br.book_id, u.name AS user_name, b.title, s.name AS librarian_name
  FROM return_records rr
  JOIN borrow_records br ON br.borrow_id = rr.borrow_id
  JOIN users u ON u.user_id = br.user_id
  JOIN books b ON b.book_id = br.book_id
  LEFT JOIN staff s ON s.staff_id = rr.received_by
`;

export async function GET() {
  const [rows] = await pool.query<RowDataPacket[]>(`${JOIN_SQL} ORDER BY rr.return_id DESC`);
  return NextResponse.json(rows.map(mapReturn));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { borrowId, condition, notes, librarianId } = body;

  if (!borrowId) {
    return NextResponse.json({ error: 'borrowId is required' }, { status: 400 });
  }

  const conditionMap: Record<string, string> = { good: 'GOOD', damaged: 'DAMAGED', lost: 'LOST' };
  const dbCondition = conditionMap[condition] ?? 'GOOD';

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [borrowRows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM borrow_records WHERE borrow_id = ? FOR UPDATE`,
      [borrowId]
    );
    if (borrowRows.length === 0) {
      await conn.rollback();
      return NextResponse.json({ error: 'borrow record not found' }, { status: 404 });
    }
    if (borrowRows[0].status === 'RETURNED') {
      await conn.rollback();
      return NextResponse.json({ error: 'already returned' }, { status: 409 });
    }
    const bookId = borrowRows[0].book_id;

    const [result] = await conn.query(
      `INSERT INTO return_records (borrow_id, return_date, book_condition, condition_note, received_by)
       VALUES (?, CURDATE(), ?, ?, ?)`,
      [borrowId, dbCondition, notes ?? '', librarianId || null]
    );

    await conn.query(`UPDATE borrow_records SET status = 'RETURNED' WHERE borrow_id = ?`, [
      borrowId,
    ]);
    await conn.query('UPDATE books SET available = available + 1 WHERE book_id = ?', [bookId]);

    await conn.commit();

    const insertId = (result as { insertId: number }).insertId;
    const [rows] = await pool.query<RowDataPacket[]>(
      `${JOIN_SQL} WHERE rr.return_id = ?`,
      [insertId]
    );
    return NextResponse.json(mapReturn(rows[0]));
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
