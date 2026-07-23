'use client';
import React, { useState } from 'react';
import { useAuth } from '../lib/context';
import LoginPage from '../components/LoginPage';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import BookCatalog from '../components/BookCatalog';
import BorrowRecords from '../components/BorrowRecords';
import ReturnRecords from '../components/ReturnRecords';
import Fines from '../components/Fines';
import Categories from '../components/Categories';
import Users from '../components/Users';
import StaffManagement from '../components/StaffManagement';
import MyReturns from '../components/MyReturns';
import MyBorrows from '../components/MyBorrows';  
import InitialsAvatar from '../components/ui/InitialsAvatar';

function AppContent() {
  const { isAuthenticated, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const goToCatalogWithCategory = (categoryId: string) => {
    setCategoryFilter(categoryId);
    setActiveTab('catalog');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'catalog': return <BookCatalog initialCategory={categoryFilter} />;
      case 'my-borrows': return <MyBorrows />;
      case 'my-returns': return <MyReturns />;
      case 'borrow-records': return <BorrowRecords />;
      case 'return-records': return <ReturnRecords />;
      case 'fines': return <Fines />;
      case 'my-fines': return <Fines />;
      case 'categories': return <Categories onChooseBooks={goToCatalogWithCategory} />;
      case 'users': return <Users />;
      case 'staff': return <StaffManagement />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
            </button>
            <div>
              <h2 className="font-semibold text-gray-800 text-sm capitalize">
                {activeTab?.replace('-', ' ')}
              </h2>
              <p className="text-xs text-gray-400 hidden sm:block">
                {currentUser?.role === 'admin' ? 'Administrator Panel' :
                 currentUser?.role === 'librarian' ? 'Librarian Dashboard' : 'Member Portal'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
              <InitialsAvatar name={currentUser?.name} className="w-6 h-6" />
              <span className="text-sm font-medium text-gray-700">{currentUser?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return <AppContent />;
}
