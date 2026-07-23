'use client';
import React, { useState } from 'react';
import { useLibrary } from '../lib/libraryContext';
import InitialsAvatar from './ui/InitialsAvatar';

export default function StaffManagement() {
  const { staff, addStaff, toggleStaffStatus } = useLibrary();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{ name: string; email: string; role: 'librarian' | 'assistant'; phone: string; department: string }>({ name: '', email: '', role: 'librarian', phone: '', department: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addStaff(form);
    setShowModal(false);
    setForm({ name: '', email: '', role: 'librarian', phone: '', department: '' });
  };

  const handleToggle = (id: string, status: 'active' | 'inactive') => {
    toggleStaffStatus(id, status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
          <p className="text-gray-500 text-sm mt-1">{staff.length} staff members</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <span>+</span> Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p className="text-sm text-indigo-600 font-medium">Total Staff</p>
          <p className="text-2xl font-bold text-indigo-800">{staff.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-600 font-medium">Active</p>
          <p className="text-2xl font-bold text-green-800">{staff.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-sm text-purple-600 font-medium">Librarians</p>
          <p className="text-2xl font-bold text-purple-800">{staff.filter(s => s.role === 'librarian').length}</p>
        </div>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map(member => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start gap-4">
              <InitialsAvatar name={member.name} className="w-12 h-12" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm">{member.name}</h3>
                <p className="text-xs text-gray-500 truncate">{member.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    member.role === 'librarian' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-xs text-gray-500">📞 {member.phone}</p>
              <p className="text-xs text-gray-500">🏢 {member.department}</p>
              <p className="text-xs text-gray-500">📅 Joined {member.joinDate}</p>
            </div>
            <button
              onClick={() => handleToggle(member.id, member.status)}
              className={`mt-4 w-full text-xs py-1.5 rounded-lg font-medium transition-colors ${
                member.status === 'active' ?'bg-red-50 hover:bg-red-100 text-red-600' :'bg-green-50 hover:bg-green-100 text-green-600'
              }`}
            >
              {member.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-lg">Add Staff Member</h3>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value as 'librarian' | 'assistant'})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="librarian">Librarian</option>
                    <option value="assistant">Assistant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Add Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
