'use client';
import React, { useState } from 'react';
import { useAuth } from '../lib/context';
import { useLibrary } from '../lib/libraryContext';

const RATE_PER_DAY = 0.5;

export default function Fines() {
  const { currentUser } = useAuth();
  const { borrowRecords, daysOverdue, fines, users, addFine, setFineStatus } = useLibrary();
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedBorrowId, setSelectedBorrowId] = useState('');
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');

  const isUser = currentUser?.role === 'user';
  const displayFines = isUser
    ? fines.filter(f => f.userId === currentUser?.id)
    : fines.filter(f => filter === 'all' || f.status === filter);

  const members = users;

  // Overdue borrows for the currently selected user in the Issue Fine modal.
  const overdueForSelectedUser = borrowRecords.filter(
    b => b.userId === selectedUserId && b.status === 'overdue'
  );

  const selectedBorrow = borrowRecords.find(b => b.id === selectedBorrowId);

  const openModal = () => {
    setSelectedUserId('');
    setSelectedBorrowId('');
    setAmount(0);
    setReason('');
    setShowModal(true);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedBorrowId('');
    setAmount(0);
    setReason('');
  };

  const handleSelectBorrow = (borrowId: string) => {
    setSelectedBorrowId(borrowId);
    const borrow = borrowRecords.find(b => b.id === borrowId);
    if (borrow) {
      const overdue = daysOverdue(borrow.dueDate);
      setAmount(Number((overdue * RATE_PER_DAY).toFixed(2)));
      setReason(`Overdue return (${overdue} day${overdue === 1 ? '' : 's'})`);
    }
  };

  const handleMarkPaid = (id: string) => {
    setFineStatus(id, 'paid');
  };

  const handleWaive = (id: string) => {
    setFineStatus(id, 'waived');
  };

  const handleAddFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBorrow) return;
    await addFine({ borrowId: selectedBorrow.id, amount, reason });
    setShowModal(false);
  };

  const totalPending = fines.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{isUser ? 'My Fines' : 'Fines Management'}</h2>
          <p className="text-gray-500 text-sm mt-1">{displayFines.length} records</p>
        </div>
        {!isUser && (
          <button
            onClick={openModal}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>+</span> Issue Fine
          </button>
        )}
      </div>

      {/* Summary Cards (non-user) */}
      {!isUser && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-amber-800">${totalPending.toFixed(2)}</p>
            <p className="text-xs text-amber-500">{fines.filter(f => f.status === 'pending').length} fines</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-600 font-medium">Collected</p>
            <p className="text-2xl font-bold text-green-800">${fines.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0).toFixed(2)}</p>
            <p className="text-xs text-green-500">{fines.filter(f => f.status === 'paid').length} paid</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600 font-medium">Waived</p>
            <p className="text-2xl font-bold text-gray-800">${fines.filter(f => f.status === 'waived').reduce((s, f) => s + f.amount, 0).toFixed(2)}</p>
            <p className="text-xs text-gray-500">{fines.filter(f => f.status === 'waived').length} waived</p>
          </div>
        </div>
      )}

      {/* Overdue books alert (non-user) */}
      {!isUser && borrowRecords.filter(b => b.status === 'overdue').length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <span className="font-medium">{borrowRecords.filter(b => b.status === 'overdue').length} overdue borrow(s)</span> not yet fined. Click "Issue Fine" to charge a member.
        </div>
      )}

      {/* Filter Tabs */}
      {!isUser && (
        <div className="flex gap-2">
          {['all', 'pending', 'paid', 'waived'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {!isUser && <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Member</th>}
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Book</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Reason</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Issued</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                {!isUser && <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayFines.map(fine => (
                <tr key={fine.id} className="hover:bg-gray-50">
                  {!isUser && <td className="px-6 py-3 text-sm font-medium text-gray-800">{fine.userName}</td>}
                  <td className="px-6 py-3 text-sm text-gray-600">{fine.bookTitle}</td>
                  <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">{fine.reason}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-800">${fine.amount.toFixed(2)}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{fine.issuedDate}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      fine.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      fine.status === 'paid'? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {fine.status.charAt(0).toUpperCase() + fine.status.slice(1)}
                    </span>
                  </td>
                  {!isUser && (
                    <td className="px-6 py-3">
                      {fine.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleMarkPaid(fine.id)} className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-lg transition-colors">Mark Paid</button>
                          <button onClick={() => handleWaive(fine.id)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-lg transition-colors">Waive</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {displayFines.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <span className="text-4xl block mb-2">✅</span>
              No fines found
            </div>
          )}
        </div>
      </div>

      {/* Issue Fine Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-lg">Issue Fine</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleAddFine} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
                <select
                  required
                  value={selectedUserId}
                  onChange={e => handleSelectUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Select a member...</option>
                  {members.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              {selectedUserId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overdue Book</label>
                  {overdueForSelectedUser.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">This member has no overdue books.</p>
                  ) : (
                    <select
                      required
                      value={selectedBorrowId}
                      onChange={e => handleSelectBorrow(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">Select a borrow...</option>
                      {overdueForSelectedUser.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.bookTitle} — due {b.dueDate} ({daysOverdue(b.dueDate)}d overdue)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {selectedBorrow && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={e => setAmount(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Auto-calculated at ${RATE_PER_DAY.toFixed(2)}/day overdue — editable.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <input
                      required
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={!selectedBorrow} className="flex-1 bg-amber-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-600">Issue Fine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
