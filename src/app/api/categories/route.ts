import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const COLORS = [
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-green-100 text-green-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
];

export async function GET() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT c.category_id, c.category_name, c.description,
            COUNT(b.book_id) AS book_count
     FROM categories c
     LEFT JOIN books b ON b.category_id = c.category_id
     GROUP BY c.category_id
     ORDER BY c.category_id`
  );

  const categories = rows.map((r, i) => ({
    id: String(r.category_id),
    name: r.category_name,
    description: r.description ?? '',
    bookCount: Number(r.book_count),
    color: COLORS[i % COLORS.length],
  }));

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description } = body;
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO categories (category_name, description) VALUES (?, ?)',
    [name, description ?? '']
  );
  return NextResponse.json({
    id: String(result.insertId),
    name,
    description: description ?? '',
    bookCount: 0,
    color: COLORS[0],
  });
}
