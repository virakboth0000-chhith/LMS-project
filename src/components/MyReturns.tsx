'use client';
import React from 'react';
import { useAuth } from '../lib/context';
import { useLibrary } from '../lib/libraryContext';

export default function MyReturns() {
  const { currentUser } = useAuth();
  const { returnRecords } = useLibrary();

  const myReturnHistory = returnRecords.filter(r => r.userId === currentUser?.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Return Records</h2>
        <p className="text-gray-500 text-sm mt-1">{myReturnHistory.length} return{myReturnHistory.length !== 1 ? 's' : ''} processed</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Book</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Return Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Condition</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myReturnHistory.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-800">{record.bookTitle}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{record.returnDate}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      record.condition === 'good' ? 'bg-green-100 text-green-700' :
                      record.condition === 'damaged' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {record.condition.charAt(0).toUpperCase() + record.condition.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-400 max-w-xs truncate">{record.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {myReturnHistory.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <span className="text-4xl block mb-2">↩️</span>
              No return records found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}