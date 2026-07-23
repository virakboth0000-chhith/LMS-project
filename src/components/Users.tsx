'use client';
import React, { useState } from 'react';
import { useLibrary } from '../lib/libraryContext';
import InitialsAvatar from './ui/InitialsAvatar';

export default function Users() {
  const { users, toggleUserStatus, addUser } = useLibrary();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (id: string, status: 'active' | 'suspended') => {
    toggleUserStatus(id, status);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addUser({ name: form.name, email: form.email, phone: form.phone });
    setShowModal(false);
    setForm({ name: '', email: '', phone: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Users</h2>
          <p className="text-gray-500 text-sm mt-1">{users.length} registered members</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <span>+</span> Add User
        </button>
      </div>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Member</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Email</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Phone</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Join Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Borrowed</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={user.name} className="w-8 h-8" />
                      <span className="text-sm font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{user.phone}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{user.joinDate}</td>
                  <td className="px-6 py-3 text-sm text-gray-600 text-center">{user.borrowedCount}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                        user.status === 'active' ?'bg-red-50 hover:bg-red-100 text-red-600' :'bg-green-50 hover:bg-green-100 text-green-600'
                      }`}
                    >
                      {user.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">No users found</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-lg">Add New User</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
