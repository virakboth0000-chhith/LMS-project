export type Role = 'admin' | 'librarian' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'suspended';
  borrowedCount: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  bookCount: number;
  color: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  category: string;
  publisher: string;
  publishYear: number;
  totalCopies: number;
  availableCopies: number;
  cover: string;
  coverAlt: string;
  description: string;
  status: 'available' | 'unavailable';
}

export interface BorrowRecord {
  id: string;
  userId: string;
  userName: string;
  bookId: string;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  status: 'active' | 'returned' | 'overdue';
  librarianId: string;
  librarianName: string;
}

export interface ReturnRecord {
  id: string;
  borrowId: string;
  userId: string;
  userName: string;
  bookId: string;
  bookTitle: string;
  returnDate: string;
  condition: 'good' | 'damaged' | 'lost';
  librarianId: string;
  librarianName: string;
  notes: string;
}

export interface Fine {
  id: string;
  userId: string;
  userName: string;
  borrowId: string;
  bookTitle: string;
  amount: number;
  reason: string;
  status: 'pending' | 'paid' | 'waived';
  issuedDate: string;
  paidDate?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'librarian' | 'assistant';
  phone: string;
  department: string;
  joinDate: string;
  status: 'active' | 'inactive';
  avatar: string;
}

export const mockUsers: User[] = [
{ id: 'u1', name: 'Alice Johnson', email: 'alice@example.com', role: 'user', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', phone: '+1-555-0101', joinDate: '2024-01-15', status: 'active', borrowedCount: 3 },
{ id: 'u2', name: 'Bob Martinez', email: 'bob@example.com', role: 'user', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', phone: '+1-555-0102', joinDate: '2024-02-20', status: 'active', borrowedCount: 1 },
{ id: 'u3', name: 'Carol White', email: 'carol@example.com', role: 'user', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop', phone: '+1-555-0103', joinDate: '2024-03-10', status: 'active', borrowedCount: 0 },
{ id: 'u4', name: 'David Lee', email: 'david@example.com', role: 'user', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', phone: '+1-555-0104', joinDate: '2024-01-05', status: 'suspended', borrowedCount: 2 },
{ id: 'u5', name: 'Emma Davis', email: 'emma@example.com', role: 'user', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop', phone: '+1-555-0105', joinDate: '2024-04-01', status: 'active', borrowedCount: 1 },
{ id: 'l1', name: 'Sarah Chen', email: 'sarah@library.com', role: 'librarian', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop', phone: '+1-555-0201', joinDate: '2023-06-01', status: 'active', borrowedCount: 0 },
{ id: 'a1', name: 'Michael Brown', email: 'admin@library.com', role: 'admin', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop', phone: '+1-555-0301', joinDate: '2022-01-01', status: 'active', borrowedCount: 0 }];


export const mockCategories: Category[] = [
{ id: 'c1', name: 'Fiction', description: 'Novels, short stories, and imaginative literature', bookCount: 45, color: 'bg-purple-100 text-purple-700' },
{ id: 'c2', name: 'Science & Technology', description: 'Books on science, engineering, and technology', bookCount: 38, color: 'bg-blue-100 text-blue-700' },
{ id: 'c3', name: 'History', description: 'Historical accounts and biographies', bookCount: 29, color: 'bg-amber-100 text-amber-700' },
{ id: 'c4', name: 'Self-Help', description: 'Personal development and motivational books', bookCount: 22, color: 'bg-green-100 text-green-700' },
{ id: 'c5', name: 'Children', description: 'Books for young readers and children', bookCount: 31, color: 'bg-pink-100 text-pink-700' },
{ id: 'c6', name: 'Philosophy', description: 'Philosophical works and critical thinking', bookCount: 17, color: 'bg-indigo-100 text-indigo-700' }];


export const mockBooks: Book[] = [
{ id: 'b1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0-7432-7356-5', categoryId: 'c1', category: 'Fiction', publisher: 'Scribner', publishYear: 1925, totalCopies: 5, availableCopies: 3, cover: "https://img.rocket.new/generatedImages/rocket_gen_img_162585100-1773147719611.png", coverAlt: 'The Great Gatsby book cover with golden art deco design', description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.', status: 'available' },
{ id: 'b2', title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0-553-38016-3', categoryId: 'c2', category: 'Science & Technology', publisher: 'Bantam Books', publishYear: 1988, totalCopies: 4, availableCopies: 1, cover: "https://img.rocket.new/generatedImages/rocket_gen_img_1d6f72d75-1765314173517.png", coverAlt: 'A Brief History of Time book cover with cosmic imagery', description: 'An exploration of cosmology, black holes, and the nature of time.', status: 'available' },
{ id: 'b3', title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '978-0-06-231609-7', categoryId: 'c3', category: 'History', publisher: 'Harper', publishYear: 2011, totalCopies: 6, availableCopies: 4, cover: "https://img.rocket.new/generatedImages/rocket_gen_img_1cbf32cda-1769722949805.png", coverAlt: 'Sapiens book cover showing human evolution timeline', description: 'A brief history of humankind from the Stone Age to the present.', status: 'available' },
{ id: 'b4', title: 'Atomic Habits', author: 'James Clear', isbn: '978-0-7352-1129-2', categoryId: 'c4', category: 'Self-Help', publisher: 'Avery', publishYear: 2018, totalCopies: 8, availableCopies: 5, cover: "https://images.unsplash.com/photo-1716171848317-1ca95b7f99ef", coverAlt: 'Atomic Habits book cover with minimalist design', description: 'An easy and proven way to build good habits and break bad ones.', status: 'available' },
{ id: 'b5', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0-06-112008-4', categoryId: 'c1', category: 'Fiction', publisher: 'J.B. Lippincott', publishYear: 1960, totalCopies: 5, availableCopies: 0, cover: "https://img.rocket.new/generatedImages/rocket_gen_img_1d3f254c9-1767074957661.png", coverAlt: 'To Kill a Mockingbird book cover with classic design', description: 'A story of racial injustice and the loss of innocence in the American South.', status: 'unavailable' },
{ id: 'b6', title: 'The Alchemist', author: 'Paulo Coelho', isbn: '978-0-06-112241-5', categoryId: 'c1', category: 'Fiction', publisher: 'HarperOne', publishYear: 1988, totalCopies: 7, availableCopies: 6, cover: "https://img.rocket.new/generatedImages/rocket_gen_img_1d4b70c94-1770776602041.png", coverAlt: 'The Alchemist book cover with desert and pyramid imagery', description: 'A philosophical novel about a young Andalusian shepherd on a journey to find treasure.', status: 'available' },
{ id: 'b7', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0-13-235088-4', categoryId: 'c2', category: 'Science & Technology', publisher: 'Prentice Hall', publishYear: 2008, totalCopies: 4, availableCopies: 2, cover: "https://img.rocket.new/generatedImages/rocket_gen_img_1cbd0c78f-1767347472104.png", coverAlt: 'Clean Code book cover with programming theme', description: 'A handbook of agile software craftsmanship for writing better code.', status: 'available' },
{ id: 'b8', title: 'The Little Prince', author: 'Antoine de Saint-Exupéry', isbn: '978-0-15-601219-5', categoryId: 'c5', category: 'Children', publisher: 'Harcourt', publishYear: 1943, totalCopies: 6, availableCopies: 4, cover: "https://img.rocket.new/generatedImages/rocket_gen_img_1a641e8c0-1765297953272.png", coverAlt: 'The Little Prince book cover with the little prince on a small planet', description: 'A poetic tale about a little prince who visits various planets in space.', status: 'available' }];


export const mockBorrowRecords: BorrowRecord[] = [
{ id: 'br1', userId: 'u1', userName: 'Alice Johnson', bookId: 'b1', bookTitle: 'The Great Gatsby', borrowDate: '2025-06-15', dueDate: '2025-06-29', status: 'active', librarianId: 'l1', librarianName: 'Sarah Chen' },
{ id: 'br2', userId: 'u1', userName: 'Alice Johnson', bookId: 'b2', bookTitle: 'A Brief History of Time', borrowDate: '2025-06-20', dueDate: '2025-07-04', status: 'active', librarianId: 'l1', librarianName: 'Sarah Chen' },
{ id: 'br3', userId: 'u2', userName: 'Bob Martinez', bookId: 'b3', bookTitle: 'Sapiens', borrowDate: '2025-06-10', dueDate: '2025-06-24', status: 'overdue', librarianId: 'l1', librarianName: 'Sarah Chen' },
{ id: 'br4', userId: 'u4', userName: 'David Lee', bookId: 'b5', bookTitle: 'To Kill a Mockingbird', borrowDate: '2025-05-20', dueDate: '2025-06-03', status: 'overdue', librarianId: 'l1', librarianName: 'Sarah Chen' },
{ id: 'br5', userId: 'u5', userName: 'Emma Davis', bookId: 'b7', bookTitle: 'Clean Code', borrowDate: '2025-06-25', dueDate: '2025-07-09', status: 'active', librarianId: 'l1', librarianName: 'Sarah Chen' },
{ id: 'br6', userId: 'u3', userName: 'Carol White', bookId: 'b4', bookTitle: 'Atomic Habits', borrowDate: '2025-06-01', dueDate: '2025-06-15', status: 'returned', librarianId: 'l1', librarianName: 'Sarah Chen' }];


export const mockReturnRecords: ReturnRecord[] = [
{ id: 'rr1', borrowId: 'br6', userId: 'u3', userName: 'Carol White', bookId: 'b4', bookTitle: 'Atomic Habits', returnDate: '2025-06-14', condition: 'good', librarianId: 'l1', librarianName: 'Sarah Chen', notes: 'Returned in excellent condition' },
{ id: 'rr2', borrowId: 'br7', userId: 'u2', userName: 'Bob Martinez', bookId: 'b6', bookTitle: 'The Alchemist', returnDate: '2025-06-10', condition: 'good', librarianId: 'l1', librarianName: 'Sarah Chen', notes: '' },
{ id: 'rr3', borrowId: 'br8', userId: 'u1', userName: 'Alice Johnson', bookId: 'b8', bookTitle: 'The Little Prince', returnDate: '2025-05-30', condition: 'damaged', librarianId: 'l1', librarianName: 'Sarah Chen', notes: 'Cover slightly torn' }];


export const mockFines: Fine[] = [
{ id: 'f1', userId: 'u2', userName: 'Bob Martinez', borrowId: 'br3', bookTitle: 'Sapiens', amount: 7.50, reason: 'Overdue return (15 days)', status: 'pending', issuedDate: '2025-06-25' },
{ id: 'f2', userId: 'u4', userName: 'David Lee', borrowId: 'br4', bookTitle: 'To Kill a Mockingbird', amount: 25.00, reason: 'Overdue return (35 days)', status: 'pending', issuedDate: '2025-07-08' },
{ id: 'f3', userId: 'u1', userName: 'Alice Johnson', borrowId: 'br8', bookTitle: 'The Little Prince', amount: 15.00, reason: 'Damaged book - cover torn', status: 'paid', issuedDate: '2025-05-31', paidDate: '2025-06-05' },
{ id: 'f4', userId: 'u3', userName: 'Carol White', borrowId: 'br9', bookTitle: 'Atomic Habits', amount: 3.00, reason: 'Overdue return (6 days)', status: 'waived', issuedDate: '2025-06-16' }];


export const mockStaff: Staff[] = [
{ id: 'st1', name: 'Sarah Chen', email: 'sarah@library.com', role: 'librarian', phone: '+1-555-0201', department: 'Main Library', joinDate: '2023-06-01', status: 'active', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop' },
{ id: 'st2', name: 'James Wilson', email: 'james@library.com', role: 'librarian', phone: '+1-555-0202', department: 'Reference Section', joinDate: '2023-09-15', status: 'active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop' },
{ id: 'st3', name: 'Linda Park', email: 'linda@library.com', role: 'assistant', phone: '+1-555-0203', department: 'Children Section', joinDate: '2024-01-10', status: 'active', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop' },
{ id: 'st4', name: 'Tom Garcia', email: 'tom@library.com', role: 'assistant', phone: '+1-555-0204', department: 'Digital Resources', joinDate: '2024-03-20', status: 'inactive', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop' }];


export const currentUser: User = mockUsers[5]; // Default: librarian for demo