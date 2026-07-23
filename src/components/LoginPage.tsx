'use client';
import React, { useState } from 'react';
import { useAuth } from '../lib/context';
import { Role } from '../lib/data';

const demoAccounts = [
  { label: 'Admin', email: 'admin@library.com', role: 'admin' as Role, color: 'bg-red-500', icon: '👑' },
  { label: 'Librarian', email: 'sophal@library.com', role: 'librarian' as Role, color: 'bg-indigo-500', icon: '📚' },
  { label: 'User', email: 'dara@example.com', role: 'user' as Role, color: 'bg-emerald-500', icon: '👤' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, password, role);
    if (!success) {
      setError('Invalid credentials. Try a demo account below.');
    }
    setLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string, demoRole: Role) => {
    setLoading(true);
    await login(demoEmail, 'password123', demoRole);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">📖</span>
          </div>
          <h1 className="text-3xl font-bold text-white">LibraMS</h1>
          <p className="text-indigo-200 mt-1">Library Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                placeholder="Enter your password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
              >
                <option value="user">User</option>
                <option value="librarian">Librarian</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6">
            <p className="text-xs text-gray-500 text-center mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.role}
                  onClick={() => handleDemoLogin(acc.email, acc.role)}
                  disabled={loading}
                  className={`${acc.color} text-white rounded-lg py-2 px-3 text-xs font-medium hover:opacity-90 transition-opacity flex flex-col items-center gap-1 disabled:opacity-60`}
                >
                  <span className="text-lg">{acc.icon}</span>
                  <span>{acc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
