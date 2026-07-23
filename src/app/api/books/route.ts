import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

function mapBook(r: RowDataPacket) {
  return {
    id: String(r.book_id),
    title: r.title,
    author: r.author,
    isbn: r.isbn ?? '',
    categoryId: r.category_id ? String(r.category_id) : '',
    category: r.category_name ?? 'Uncategorized',
    publisher: r.publisher ?? '',
    publishYear: r.publish_year ?? new Date().getFullYear(),
    totalCopies: r.quantity,
    availableCopies: r.available,
    cover: r.cover ?? '',
    coverAlt: `${r.title} book cover`,
    description: r.description ?? '',
    status: r.available > 0 ? 'available' : 'unavailable',
  };
}

export async function GET() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT b.*, c.category_name
     FROM books b
     LEFT JOIN categories c ON c.category_id = b.category_id
     ORDER BY b.book_id`
  );
  return NextResponse.json(rows.map(mapBook));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title,
    author,
    isbn,
    categoryId,
    publisher,
    publishYear,
    totalCopies,
    cover,
    description,
  } = body;

  if (!title || !author) {
    return NextResponse.json({ error: 'title and author are required' }, { status: 400 });
  }

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO books
      (title, author, isbn, publisher, publish_year, quantity, available, category_id, cover, description, added_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
    [
      title,
      author,
      isbn ?? '',
      publisher ?? '',
      publishYear ?? new Date().getFullYear(),
      totalCopies ?? 1,
      totalCopies ?? 1,
      categoryId || null,
      cover ?? '',
      description ?? '',
    ]
  );

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT b.*, c.category_name
     FROM books b LEFT JOIN categories c ON c.category_id = b.category_id
     WHERE b.book_id = ?`,
    [result.insertId]
  );

  return NextResponse.json(mapBook(rows[0]));
}
