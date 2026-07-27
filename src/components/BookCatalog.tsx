'use client';
import React, { useState } from 'react';
import { Book } from '../lib/data';
import { useAuth } from '../lib/context';
import { useLibrary } from '../lib/libraryContext';

interface BookCatalogProps {
  /** Pre-selects a category filter, e.g. when arriving from the "Choose Books" button on Categories. */
  initialCategory?: string;
}

const COVER_OPTIONS = ['📖', '📗', '📘', '📙', '📕', '📔'];

interface BookRow {
  rowId: string;
  cover: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  publisher: string;
  publishYear: number;
  description: string;
  totalCopies: number;
  availableCopies: number;
}

const makeEmptyRow = (): BookRow => ({
  rowId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  cover: '📖',
  title: '',
  author: '',
  isbn: '',
  categoryId: '',
  publisher: '',
  publishYear: 2024,
  description: '',
  totalCopies: 1,
  availableCopies: 1,
});

export default function BookCatalog({ initialCategory }: BookCatalogProps) {
  const { currentUser } = useAuth();
  const { books, categories, addBook, updateBook, borrowBook } = useLibrary();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookRows, setBookRows] = useState<BookRow[]>([makeEmptyRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [borrowedMsg, setBorrowedMsg] = useState<string | null>(null);
  const [viewingBook, setViewingBook] = useState<Book | null>(null);

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'librarian';

  const filtered = books.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || b.categoryId === selectedCategory;
    return matchSearch && matchCat;
  });

  const resetAddForm = () => {
    setBookRows([makeEmptyRow()]);
  };

  const updateRow = (rowId: string, patch: Partial<BookRow>) => {
    setBookRows(rows => rows.map(r => {
      if (r.rowId !== rowId) return r;
      const next = { ...r, ...patch };
      // Keep available copies in lockstep with total copies unless the user
      // has deliberately lowered it below the new total.
      if (patch.totalCopies !== undefined && next.availableCopies > next.totalCopies) {
        next.availableCopies = next.totalCopies;
      }
      return next;
    }));
  };

  const addRow = () => setBookRows(rows => [...rows, makeEmptyRow()]);
  const removeRow = (rowId: string) => setBookRows(rows => rows.length > 1 ? rows.filter(r => r.rowId !== rowId) : rows);

  const handleAddBooks = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await Promise.all(bookRows.map(row => addBook({
        title: row.title,
        author: row.author,
        isbn: row.isbn,
        cover: row.cover,
        categoryId: row.categoryId,
        publisher: row.publisher,
        publishYear: row.publishYear,
        description: row.description,
        totalCopies: row.totalCopies,
        ...(canManage ? { availableCopies: row.availableCopies } : {}),
      })));
      setShowAddModal(false);
      resetAddForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setEditCategoryId(book.categoryId);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    await updateBook(editingBook.id, { categoryId: editCategoryId });
    setEditingBook(null);
  };

  const handleBorrow = async (book: Book) => {
    if (!currentUser) return;
    const ok = await borrowBook(book.id, currentUser.id, currentUser.name);
    setBorrowedMsg(ok ? `"${book.title}" added to your borrows.` : `Sorry, "${book.title}" is unavailable.`);
    setTimeout(() => setBorrowedMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {borrowedMsg && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {borrowedMsg}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Book Catalog</h2>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} books found</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>+</span> Add Books
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(book => (
          <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-44 bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center">
              <span className="text-4xl opacity-60">{(book as Book & { cover?: string }).cover || '📖'}</span>
              <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${
                book.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {book.availableCopies > 0 ? `${book.availableCopies} avail.` : 'Unavailable'}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">{book.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{book.author}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">{book.category}</span>
                <span className="text-xs text-gray-400">{book.publishYear}</span>
              </div>
              {canManage && (
                <p className="text-xs text-gray-400 mt-2">
                  {book.totalCopies} total · {book.availableCopies} available
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2 line-clamp-2">{book.description}</p>
              {canManage && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(book)} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg transition-colors">Edit</button>
                  <button onClick={() => setViewingBook(book)} className="flex-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-lg transition-colors">Details</button>
                </div>
              )}
              {!canManage && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleBorrow(book)}
                    disabled={book.availableCopies <= 0}
                    className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-1.5 rounded-lg transition-colors font-medium"
                  >
                    {book.availableCopies > 0 ? 'Select / Borrow' : 'Unavailable'}
                  </button>
                  <button onClick={() => setViewingBook(book)} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg transition-colors font-medium">
                    Details
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-3">📭</span>
          <p>No books found matching your search.</p>
        </div>
      )}

      {/* Add Books Modal — each book row has its own full set of details */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">Add Books</h3>
                <p className="text-xs text-gray-400 mt-0.5">Fill in the details for each book below.</p>
              </div>
              <button onClick={() => { setShowAddModal(false); resetAddForm(); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleAddBooks} className="p-6 space-y-6">

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Books ({bookRows.length})</h4>
                  <button type="button" onClick={addRow} className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
                    + Add Another Book
                  </button>
                </div>

                <div className="space-y-4">
                  {bookRows.map((row, idx) => (
                    <div key={row.rowId} className="border border-gray-200 rounded-xl p-4 relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500">Book {idx + 1}</span>
                        {bookRows.length > 1 && (
                          <button type="button" onClick={() => removeRow(row.rowId)} className="text-gray-400 hover:text-red-500 text-sm">✕ Remove</button>
                        )}
                      </div>

                      {/* Basic Information — own copy per book */}
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">📂 Category</label>
                            <select value={row.categoryId} onChange={e => updateRow(row.rowId, { categoryId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                              <option value="">Select category</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">🏢 Publisher</label>
                            <input value={row.publisher} onChange={e => updateRow(row.rowId, { publisher: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">📅 Publish Year</label>
                            <input type="number" value={row.publishYear} onChange={e => updateRow(row.rowId, { publishYear: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">📝 Description</label>
                            <textarea rows={2} value={row.description} onChange={e => updateRow(row.rowId, { description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">📖 Book Cover</label>
                          <select value={row.cover} onChange={e => updateRow(row.rowId, { cover: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                            {COVER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">🔢 ISBN</label>
                          <input value={row.isbn} onChange={e => updateRow(row.rowId, { isbn: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">📚 Title *</label>
                          <input required value={row.title} onChange={e => updateRow(row.rowId, { title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">✍️ Author *</label>
                          <input required value={row.author} onChange={e => updateRow(row.rowId, { author: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        {/* Staff-only: total & available copies per book */}
                        {canManage && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies</label>
                              <input type="number" min="1" value={row.totalCopies} onChange={e => updateRow(row.rowId, { totalCopies: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Available Copies</label>
                              <input type="number" min="0" max={row.totalCopies} value={row.availableCopies} onChange={e => updateRow(row.rowId, { availableCopies: Math.min(parseInt(e.target.value) || 0, row.totalCopies) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white">
                <button type="button" onClick={() => { setShowAddModal(false); resetAddForm(); }} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors">
                  {isSubmitting ? 'Adding...' : `Add ${bookRows.length} Book${bookRows.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-lg">Edit Book Category</h3>
              <button onClick={() => setEditingBook(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleUpdateCategory} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Book</p>
                <p className="font-medium text-gray-800">{editingBook.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={editCategoryId}
                  onChange={e => setEditCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingBook(null)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Details Modal — everyone sees Basic Information; staff also see copy counts */}
      {viewingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-800 text-lg">Book Details</h3>
              <button onClick={() => setViewingBook(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex justify-center">
                <div className="h-28 w-28 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-5xl">
                  {(viewingBook as Book & { cover?: string }).cover || '📖'}
                </div>
              </div>

              {/* Basic Information — visible to everyone */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h4>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div className="col-span-2">
                    <dt className="text-xs text-gray-400 mb-0.5">📚 Title</dt>
                    <dd className="text-gray-800 font-medium">{viewingBook.title}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">✍️ Author</dt>
                    <dd className="text-gray-800">{viewingBook.author}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">🔢 ISBN</dt>
                    <dd className="text-gray-800">{viewingBook.isbn || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">📂 Category</dt>
                    <dd className="text-gray-800">{viewingBook.category}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">🏢 Publisher</dt>
                    <dd className="text-gray-800">{viewingBook.publisher || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">📅 Publish Year</dt>
                    <dd className="text-gray-800">{viewingBook.publishYear}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-gray-400 mb-0.5">📝 Description</dt>
                    <dd className="text-gray-800">{viewingBook.description || 'No description available.'}</dd>
                  </div>
                </dl>
              </div>

              {/* Copies — staff (librarian/admin) only */}
              {canManage && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Copies</h4>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Total Copies</dt>
                      <dd className="text-gray-800 font-medium">{viewingBook.totalCopies}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Available Copies</dt>
                      <dd className="text-gray-800 font-medium">{viewingBook.availableCopies}</dd>
                    </div>
                  </dl>
                </div>
              )}

              {!canManage && (
                <div className="pt-2">
                  <button
                    onClick={() => { setViewingBook(null); handleBorrow(viewingBook); }}
                    disabled={viewingBook.availableCopies <= 0}
                    className="w-full text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors font-medium"
                  >
                    {viewingBook.availableCopies > 0 ? 'Select / Borrow' : 'Unavailable'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}