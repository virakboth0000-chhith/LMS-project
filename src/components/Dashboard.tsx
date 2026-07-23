'use client';
import React from 'react';
import { useAuth } from '../lib/context';
import { useLibrary } from '../lib/libraryContext';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  sub?: string;
}

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-xl`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { books, borrowRecords, fines, users, staff, categories, loading } = useLibrary();

  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.availableCopies > 0).length;
  const activeBorrows = borrowRecords.filter(b => b.status === 'active').length;
  const overdueBorrows = borrowRecords.filter(b => b.status === 'overdue').length;
  const pendingFines = fines.filter(f => f.status === 'pending').length;
  const totalFineAmount = fines.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
  const totalUsers = users.length;
  const totalStaff = staff.length;

  const userBorrows = borrowRecords.filter(b => b.userId === currentUser?.id);
  const userFines = fines.filter(f => f.userId === currentUser?.id && f.status === 'pending');

  const recentBorrows = borrowRecords.slice(0, 5);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome back, {currentUser?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening in the library today.</p>
      </div>

      {/* Stats Grid */}
      {currentUser?.role === 'admin' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Books" value={totalBooks} icon="📚" color="bg-indigo-100" sub={`${availableBooks} available`} />
          <StatCard label="Active Borrows" value={activeBorrows} icon="📖" color="bg-blue-100" sub={`${overdueBorrows} overdue`} />
          <StatCard label="Pending Fines" value={`$${totalFineAmount.toFixed(2)}`} icon="💰" color="bg-amber-100" sub={`${pendingFines} unpaid`} />
          <StatCard label="Total Users" value={totalUsers} icon="👥" color="bg-emerald-100" sub={`${totalStaff} staff`} />
        </div>
      )}

      {currentUser?.role === 'librarian' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Books" value={totalBooks} icon="📚" color="bg-indigo-100" sub={`${availableBooks} available`} />
          <StatCard label="Active Borrows" value={activeBorrows} icon="📖" color="bg-blue-100" sub={`${overdueBorrows} overdue`} />
          <StatCard label="Pending Fines" value={pendingFines} icon="💰" color="bg-amber-100" sub={`$${totalFineAmount.toFixed(2)} total`} />
          <StatCard label="Categories" value={categories.length} icon="🏷️" color="bg-purple-100" sub="book categories" />
        </div>
      )}

      {currentUser?.role === 'user' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Books Borrowed" value={userBorrows.filter(b => b.status === 'active').length} icon="📖" color="bg-indigo-100" sub="currently active" />
          <StatCard label="Overdue Books" value={userBorrows.filter(b => b.status === 'overdue').length} icon="⏰" color="bg-red-100" sub="need return" />
          <StatCard label="Pending Fines" value={userFines.length} icon="💳" color="bg-amber-100" sub={`$${userFines.reduce((s, f) => s + f.amount, 0).toFixed(2)} total`} />
          <StatCard label="Available Books" value={availableBooks} icon="📚" color="bg-emerald-100" sub="in catalog" />
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            {currentUser?.role === 'user' ? 'My Recent Borrows' : 'Recent Borrow Activity'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Book</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Member</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Due Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(currentUser?.role === 'user' ? userBorrows : recentBorrows).map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-800">{record.bookTitle}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{record.userName}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{record.dueDate}</td>
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
          {(currentUser?.role === 'user' ? userBorrows : recentBorrows).length === 0 && (
            <div className="text-center py-8 text-gray-400">No borrow records found</div>
          )}
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueBorrows > 0 && currentUser?.role !== 'user' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-800">Overdue Alert</p>
            <p className="text-sm text-red-600">{overdueBorrows} book(s) are overdue. Please follow up with borrowers.</p>
          </div>
        </div>
      )}
    </div>
  );
}
