'use client';
import React, { useState } from 'react';
import { Book } from '../lib/data';
import { useAuth } from '../lib/context';
import { useLibrary } from '../lib/libraryContext';

interface BookCatalogProps {
  /** Pre-selects a category filter, e.g. when arriving from the "Choose Books" button on Categories. */
  initialCategory?: string;
}

export default function BookCatalog({ initialCategory }: BookCatalogProps) {
  const { currentUser } = useAuth();
  const { books, categories, addBook, updateBook, borrowBook } = useLibrary();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', categoryId: '', publisher: '', publishYear: 2024, totalCopies: 1, description: '' });
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [borrowedMsg, setBorrowedMsg] = useState<string | null>(null);

  const filtered = books.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || b.categoryId === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBook(newBook);
    setShowAddModal(false);
    setNewBook({ title: '', author: '', isbn: '', categoryId: '', publisher: '', publishYear: 2024, totalCopies: 1, description: '' });
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

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'librarian';

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
            <span>+</span> Add Book
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
              <span className="text-4xl opacity-60">📖</span>
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
              <p className="text-xs text-gray-400 mt-2 line-clamp-2">{book.description}</p>
              {canManage && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(book)} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg transition-colors">Edit</button>
                  <button className="flex-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-lg transition-colors">Details</button>
                </div>
              )}
              {!canManage && (
                <div className="mt-3">
                  <button
                    onClick={() => handleBorrow(book)}
                    disabled={book.availableCopies <= 0}
                    className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-1.5 rounded-lg transition-colors font-medium"
                  >
                    {book.availableCopies > 0 ? 'Select / Borrow' : 'Unavailable'}
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

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-lg">Add New Book</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleAddBook} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input required value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                  <input required value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={newBook.categoryId} onChange={e => setNewBook({...newBook, categoryId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                  <input value={newBook.publisher} onChange={e => setNewBook({...newBook, publisher: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publish Year</label>
                  <input type="number" value={newBook.publishYear} onChange={e => setNewBook({...newBook, publishYear: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies</label>
                  <input type="number" min="1" value={newBook.totalCopies} onChange={e => setNewBook({...newBook, totalCopies: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Add Book</button>
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
    </div>
  );
}
