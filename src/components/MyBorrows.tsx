'use client';
import React, { useState } from 'react';
import { useAuth } from '../lib/context';
import { useLibrary } from '../lib/libraryContext';
import { BorrowRecord } from '../lib/data';

export default function MyBorrows() {
  const { currentUser } = useAuth();
  const { borrowRecords, returnBook } = useLibrary();

  const [returnTarget, setReturnTarget] = useState<BorrowRecord | null>(null);
  const [condition, setCondition] = useState<'good' | 'damaged' | 'lost'>('good');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');

  const userBorrows = borrowRecords.filter(b => b.userId === currentUser?.id);

  const openReturn = (borrow: BorrowRecord) => {
    setCondition('good');
    setNotes('');
    setReturnTarget(borrow);
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnTarget) return;
    const ok = await returnBook(returnTarget.id, condition, notes, null);
    if (ok) {
      setSuccess(`"${returnTarget.bookTitle}" has been returned. Thanks!`);
      setReturnTarget(null);
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Borrows</h2>
        <p className="text-gray-500 text-sm mt-1">{userBorrows.length} total records</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg">
          ✅ {success}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-600 font-medium">Active</p>
          <p className="text-2xl font-bold text-blue-800">{userBorrows.filter(b => b.status === 'active').length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600 font-medium">Overdue</p>
          <p className="text-2xl font-bold text-red-800">{userBorrows.filter(b => b.status === 'overdue').length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-600 font-medium">Returned</p>
          <p className="text-2xl font-bold text-green-800">{userBorrows.filter(b => b.status === 'returned').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Book</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Borrow Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Due Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {userBorrows.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-800">{record.bookTitle}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{record.borrowDate}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{record.dueDate}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      record.status === 'active' ? 'bg-blue-100 text-blue-700' :
                      record.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {(record.status === 'active' || record.status === 'overdue') ? (
                      <button
                        onClick={() => openReturn(record)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        ↩️ Return
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {userBorrows.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <span className="text-4xl block mb-2">📚</span>
              You haven't borrowed any books yet.
            </div>
          )}
        </div>
      </div>

      {/* Return Modal */}
      {returnTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-lg">Return Book</h3>
              <button onClick={() => setReturnTarget(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleReturn} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Book</p>
                <p className="font-medium text-gray-800">{returnTarget.bookTitle}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book Condition</label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value as 'good' | 'damaged' | 'lost')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="good">Good</option>
                  <option value="damaged">Damaged</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Optional notes..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setReturnTarget(null)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Confirm Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}