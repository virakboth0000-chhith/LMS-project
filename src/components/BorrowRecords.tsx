'use client';
import React, { useState } from 'react';
import { useLibrary } from '../lib/libraryContext';

export default function BorrowRecords() {
  const { borrowRecords: records, users, books, addBorrowRecord } = useLibrary();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newRecord, setNewRecord] = useState({ userId: '', bookId: '', dueDate: '' });

  const filtered = records.filter(r => filter === 'all' || r.status === filter);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.userId || !newRecord.bookId) return;
    await addBorrowRecord(newRecord.userId, newRecord.bookId, newRecord.dueDate);
    setShowModal(false);
    setNewRecord({ userId: '', bookId: '', dueDate: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Borrow Records</h2>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} records</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <span>+</span> New Borrow
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'overdue', 'returned'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1 text-xs opacity-70">
              ({f === 'all' ? records.length : records.filter(r => r.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Member</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Book</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Borrow Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Due Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Librarian</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-800">{record.userName}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{record.bookTitle}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{record.borrowDate}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{record.dueDate}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{record.librarianName}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      record.status === 'active' ? 'bg-blue-100 text-blue-700' :
                      record.status === 'overdue'? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">No records found</div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-lg">New Borrow Record</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
                <select value={newRecord.userId} onChange={e => setNewRecord({...newRecord, userId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">Select a member...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
                <select value={newRecord.bookId} onChange={e => setNewRecord({...newRecord, bookId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">Select a book...</option>
                  {books.filter(b => b.availableCopies > 0).map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input required type="date" value={newRecord.dueDate} onChange={e => setNewRecord({...newRecord, dueDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Create Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
