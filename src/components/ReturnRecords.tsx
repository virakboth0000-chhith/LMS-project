'use client';
import React, { useState } from 'react';
import { useAuth } from '../lib/context';
import { useLibrary } from '../lib/libraryContext';

export default function ReturnRecords() {
  const { currentUser } = useAuth();
  const { returnRecords: records, borrowRecords, returnBook } = useLibrary();
  const [showModal, setShowModal] = useState(false);
  const [newReturn, setNewReturn] = useState<{ borrowId: string; condition: 'good' | 'damaged' | 'lost'; notes: string }>({ borrowId: '', condition: 'good', notes: '' });

  const activeBorrows = borrowRecords.filter(b => b.status === 'active' || b.status === 'overdue');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReturn.borrowId) return;
    await returnBook(newReturn.borrowId, newReturn.condition, newReturn.notes, currentUser?.id || null);
    setShowModal(false);
    setNewReturn({ borrowId: '', condition: 'good', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Return Records</h2>
          <p className="text-gray-500 text-sm mt-1">{records.length} returns processed</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <span>↩️</span> Process Return
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Member</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Book</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Return Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Condition</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Processed By</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-800">{record.userName}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{record.bookTitle}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{record.returnDate}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      record.condition === 'good' ? 'bg-green-100 text-green-700' :
                      record.condition === 'damaged'? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {record.condition.charAt(0).toUpperCase() + record.condition.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{record.librarianName}</td>
                  <td className="px-6 py-3 text-sm text-gray-400 max-w-xs truncate">{record.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <div className="text-center py-10 text-gray-400">No return records found</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-lg">Process Book Return</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Active Borrow</label>
                <select value={newReturn.borrowId} onChange={e => setNewReturn({...newReturn, borrowId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">Select a borrow...</option>
                  {activeBorrows.map(b => <option key={b.id} value={b.id}>{b.userName} — {b.bookTitle}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book Condition</label>
                <select value={newReturn.condition} onChange={e => setNewReturn({...newReturn, condition: e.target.value as 'good' | 'damaged' | 'lost'})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="good">Good</option>
                  <option value="damaged">Damaged</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={3} value={newReturn.notes} onChange={e => setNewReturn({...newReturn, notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Optional notes..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Process Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
