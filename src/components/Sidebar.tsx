'use client';
import React, { useState } from 'react';
import { useAuth } from '../lib/context';
import { Role } from '../lib/data';
import InitialsAvatar from './ui/InitialsAvatar';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  roles: Role[];
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', roles: ['admin', 'librarian', 'user'] },
  { id: 'catalog', label: 'Book Catalog', icon: '📚', roles: ['admin', 'librarian', 'user'] },
  { id: 'my-borrows', label: 'My Borrows', icon: '📖', roles: ['user'] },
  { id: 'borrow-records', label: 'Borrow Records', icon: '📋', roles: ['admin', 'librarian'] },
  { id: 'my-returns', label: 'Return Records', icon: '↩️', roles: ['user'] },
  { id: 'fines', label: 'Fines', icon: '💰', roles: ['admin', 'librarian'] },
  { id: 'my-fines', label: 'My Fines', icon: '💳', roles: ['user'] },
  { id: 'categories', label: 'Categories', icon: '🏷️', roles: ['admin', 'librarian', 'user'] },
  { id: 'users', label: 'Users', icon: '👥', roles: ['admin'] },
  { id: 'staff', label: 'Staff', icon: '🧑‍💼', roles: ['admin'] },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ activeTab, onTabChange, isMobileOpen, onMobileClose }: SidebarProps) {
  const { currentUser, logout } = useAuth();

  const visibleItems = sidebarItems.filter(item =>
    currentUser && item.roles.includes(currentUser.role)
  );

  const handleTabChange = (id: string) => {
    onTabChange(id);
    onMobileClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={onMobileClose} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-indigo-900 text-white z-30 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-indigo-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <span className="text-xl">📖</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">LibraMS</h1>
              <p className="text-indigo-300 text-xs mt-0.5">Library System</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-indigo-700">
          <div className="flex items-center gap-3">
            <InitialsAvatar name={currentUser?.name} className="w-9 h-9" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{currentUser?.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                currentUser?.role === 'admin' ? 'bg-red-500' :
                currentUser?.role === 'librarian' ? 'bg-indigo-500' : 'bg-emerald-500'
              }`}>
                {currentUser?.role?.charAt(0).toUpperCase()}{currentUser?.role?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 flex-1 overflow-y-auto">
          {visibleItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 text-left ${
                activeTab === item.id
                  ? 'bg-white text-indigo-900' :'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-indigo-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-200 hover:bg-indigo-800 hover:text-white transition-colors"
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
