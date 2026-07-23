import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { RowDataPacket } from 'mysql2';

function mapBorrow(r: RowDataPacket) {
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = r.due_date instanceof Date ? r.due_date.toISOString().slice(0, 10) : r.due_date;
  let status: 'active' | 'returned' | 'overdue' = 'active';
  if (r.status === 'RETURNED') status = 'returned';
  else status = dueDate < today ? 'overdue' : 'active';

  return {
    id: String(r.borrow_id),
    userId: String(r.user_id),
    userName: r.user_name,
    bookId: String(r.book_id),
    bookTitle: r.title,
    borrowDate:
      r.borrow_date instanceof Date ? r.borrow_date.toISOString().slice(0, 10) : r.borrow_date,
    dueDate,
    status,
    librarianId: r.librarian_id ? String(r.librarian_id) : '',
    librarianName: r.librarian_name ?? '',
  };
}

export async function GET() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT br.*, u.name AS user_name, b.title, s.name AS librarian_name
     FROM borrow_records br
     JOIN users u ON u.user_id = br.user_id
     JOIN books b ON b.book_id = br.book_id
     LEFT JOIN staff s ON s.staff_id = br.librarian_id
     ORDER BY br.borrow_id DESC`
  );
  return NextResponse.json(rows.map(mapBorrow));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, bookId, dueDate, librarianId } = body;

  if (!userId || !bookId) {
    return NextResponse.json({ error: 'userId and bookId are required' }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [bookRows] = await conn.query<RowDataPacket[]>(
      'SELECT available FROM books WHERE book_id = ? FOR UPDATE',
      [bookId]
    );
    if (bookRows.length === 0) {
      await conn.rollback();
      return NextResponse.json({ error: 'book not found' }, { status: 404 });
    }
    if (bookRows[0].available <= 0) {
      await conn.rollback();
      return NextResponse.json({ error: 'no copies available' }, { status: 409 });
    }

    const finalDueDate =
      dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [result] = await conn.query(
      `INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status, librarian_id)
       VALUES (?, ?, CURDATE(), ?, 'BORROWED', ?)`,
      [userId, bookId, finalDueDate, librarianId || null]
    );
    await conn.query('UPDATE books SET available = available - 1 WHERE book_id = ?', [bookId]);

    await conn.commit();

    const insertId = (result as { insertId: number }).insertId;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT br.*, u.name AS user_name, b.title, s.name AS librarian_name
       FROM borrow_records br
       JOIN users u ON u.user_id = br.user_id
       JOIN books b ON b.book_id = br.book_id
       LEFT JOIN staff s ON s.staff_id = br.librarian_id
       WHERE br.borrow_id = ?`,
      [insertId]
    );
    return NextResponse.json(mapBorrow(rows[0]));
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
