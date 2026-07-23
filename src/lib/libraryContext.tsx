'use client';
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import {
  Book,
  BorrowRecord,
  ReturnRecord,
  Category,
  User,
  Staff,
  Fine,
} from './data';

interface LibraryContextType {
  loading: boolean;
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  categories: Category[];
  users: User[];
  staff: Staff[];
  borrowRecords: BorrowRecord[];
  returnRecords: ReturnRecord[];
  fines: Fine[];

  refreshAll: () => Promise<void>;

  addBook: (input: {
    title: string;
    author: string;
    isbn?: string;
    categoryId: string;
    publisher?: string;
    publishYear?: number;
    totalCopies?: number;
    cover?: string;
    description?: string;
  }) => Promise<void>;
  updateBook: (id: string, input: Partial<{
    title: string;
    author: string;
    isbn: string;
    categoryId: string;
    publisher: string;
    publishYear: number;
    totalCopies: number;
    availableCopies: number;
    cover: string;
    description: string;
  }>) => Promise<void>;

  addCategory: (name: string, description: string) => Promise<void>;
  updateCategory: (id: string, name: string, description: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addUser: (input: { name: string; email: string; phone?: string }) => Promise<void>;
  toggleUserStatus: (id: string, currentStatus: 'active' | 'suspended') => Promise<void>;

  addStaff: (input: {
    name: string;
    email: string;
    phone?: string;
    role: 'librarian' | 'assistant';
    department?: string;
  }) => Promise<void>;
  toggleStaffStatus: (id: string, currentStatus: 'active' | 'inactive') => Promise<void>;

  addFine: (input: { borrowId: string; amount: number; reason: string }) => Promise<void>;
  setFineStatus: (id: string, status: 'pending' | 'paid' | 'waived') => Promise<void>;

  borrowBook: (bookId: string, userId: string, userName: string) => Promise<boolean>;
  addBorrowRecord: (userId: string, bookId: string, dueDate?: string) => Promise<boolean>;
  returnBook: (
    borrowId: string,
    condition: 'good' | 'damaged' | 'lost',
    notes: string,
    librarianId: string | null
  ) => Promise<boolean>;
  daysOverdue: (dueDate: string) => number;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed`);
  return res.json();
}

async function sendJSON<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `${method} ${url} failed` }));
    throw new Error(err.error || `${method} ${url} failed`);
  }
  return res.json();
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [rawBorrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [returnRecords, setReturnRecords] = useState<ReturnRecord[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);

  const borrowRecords = useMemo(() => rawBorrowRecords, [rawBorrowRecords]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [b, c, u, s, br, rr, f] = await Promise.all([
        getJSON<Book[]>('/api/books'),
        getJSON<Category[]>('/api/categories'),
        getJSON<User[]>('/api/users'),
        getJSON<Staff[]>('/api/staff'),
        getJSON<BorrowRecord[]>('/api/borrow-records'),
        getJSON<ReturnRecord[]>('/api/return-records'),
        getJSON<Fine[]>('/api/fines'),
      ]);
      setBooks(b);
      setCategories(c);
      setUsers(u);
      setStaff(s);
      setBorrowRecords(br);
      setReturnRecords(rr);
      setFines(f);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const daysOverdue = (dueDate: string): number => {
    const today = new Date().toISOString().slice(0, 10);
    const diff = Math.floor((new Date(today).getTime() - new Date(dueDate).getTime()) / 86400000);
    return diff > 0 ? diff : 0;
  };

  const addBook: LibraryContextType['addBook'] = async input => {
    const book = await sendJSON<Book>('/api/books', 'POST', input);
    setBooks(prev => [...prev, book]);
    setCategories(prev =>
      prev.map(c => (c.id === input.categoryId ? { ...c, bookCount: c.bookCount + 1 } : c))
    );
  };

  const updateBook: LibraryContextType['updateBook'] = async (id, input) => {
    await sendJSON(`/api/books/${id}`, 'PATCH', input);
    await refreshAll();
  };

  const addCategory = async (name: string, description: string) => {
    const cat = await sendJSON<Category>('/api/categories', 'POST', { name, description });
    setCategories(prev => [...prev, cat]);
  };

  const updateCategory = async (id: string, name: string, description: string) => {
    await sendJSON(`/api/categories/${id}`, 'PATCH', { name, description });
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, name, description } : c)));
  };

  const deleteCategory = async (id: string) => {
    await sendJSON(`/api/categories/${id}`, 'DELETE');
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addUser: LibraryContextType['addUser'] = async input => {
    const user = await sendJSON<User>('/api/users', 'POST', input);
    setUsers(prev => [...prev, user]);
  };

  const toggleUserStatus = async (id: string, currentStatus: 'active' | 'suspended') => {
    const next = currentStatus === 'active' ? 'suspended' : 'active';
    await sendJSON(`/api/users/${id}`, 'PATCH', { status: next });
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, status: next } : u)));
  };

  const addStaff: LibraryContextType['addStaff'] = async input => {
    const member = await sendJSON<Staff>('/api/staff', 'POST', input);
    setStaff(prev => [...prev, member]);
  };

  const toggleStaffStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    const next = currentStatus === 'active' ? 'inactive' : 'active';
    await sendJSON(`/api/staff/${id}`, 'PATCH', { status: next });
    setStaff(prev => prev.map(s => (s.id === id ? { ...s, status: next } : s)));
  };

  const addFine: LibraryContextType['addFine'] = async input => {
    const fine = await sendJSON<Fine>('/api/fines', 'POST', input);
    setFines(prev => [fine, ...prev]);
  };

  const setFineStatus = async (id: string, status: 'pending' | 'paid' | 'waived') => {
    await sendJSON(`/api/fines/${id}`, 'PATCH', { status });
    setFines(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, status, paidDate: status === 'paid' ? new Date().toISOString().slice(0, 10) : undefined }
          : f
      )
    );
  };

  const borrowBook = async (bookId: string, _userId: string, _userName: string): Promise<boolean> => {
    return addBorrowRecord(_userId, bookId);
  };

  const addBorrowRecord = async (userId: string, bookId: string, dueDate?: string): Promise<boolean> => {
    try {
      const record = await sendJSON<BorrowRecord>('/api/borrow-records', 'POST', {
        userId,
        bookId,
        dueDate,
      });
      setBorrowRecords(prev => [record, ...prev]);
      setBooks(prev =>
        prev.map(b => (b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b))
      );
      return true;
    } catch {
      return false;
    }
  };

  const returnBook = async (
    borrowId: string,
    condition: 'good' | 'damaged' | 'lost',
    notes: string,
    librarianId: string | null
  ): Promise<boolean> => {
    try {
      const record = await sendJSON<ReturnRecord>('/api/return-records', 'POST', {
        borrowId,
        condition,
        notes,
        librarianId,
      });
      setReturnRecords(prev => [record, ...prev]);
      setBorrowRecords(prev =>
        prev.map(b => (b.id === borrowId ? { ...b, status: 'returned' as const } : b))
      );
      setBooks(prev =>
        prev.map(b => (b.id === record.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b))
      );
      return true;
    } catch {
      return false;
    }
  };

  return (
    <LibraryContext.Provider
      value={{
        loading,
        books,
        setBooks,
        categories,
        users,
        staff,
        borrowRecords,
        returnRecords,
        fines,
        refreshAll,
        addBook,
        updateBook,
        addCategory,
        updateCategory,
        deleteCategory,
        addUser,
        toggleUserStatus,
        addStaff,
        toggleStaffStatus,
        addFine,
        setFineStatus,
        borrowBook,
        addBorrowRecord,
        returnBook,
        daysOverdue,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return ctx;
}
