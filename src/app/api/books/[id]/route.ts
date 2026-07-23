import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { RowDataPacket } from 'mysql2';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { title, author, isbn, categoryId, publisher, publishYear, totalCopies, availableCopies, cover, description } = body;

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  const set = (col: string, val: string | number | null | undefined) => {
    if (val !== undefined) {
      fields.push(`${col} = ?`);
      values.push(val);
    }
  };

  set('title', title);
  set('author', author);
  set('isbn', isbn);
  set('publisher', publisher);
  set('publish_year', publishYear);
  set('quantity', totalCopies);
  set('available', availableCopies);
  set('category_id', categoryId || null);
  set('cover', cover);
  set('description', description);

  if (fields.length === 0) {
    return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
  }

  values.push(params.id);
  await pool.query(`UPDATE books SET ${fields.join(', ')} WHERE book_id = ?`, values);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT b.*, c.category_name FROM books b LEFT JOIN categories c ON c.category_id = b.category_id WHERE b.book_id = ?`,
    [params.id]
  );
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await pool.query('DELETE FROM books WHERE book_id = ?', [params.id]);
  return NextResponse.json({ ok: true });
}
