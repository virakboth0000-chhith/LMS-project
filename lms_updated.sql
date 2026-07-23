
DROP DATABASE IF EXISTS lms;
CREATE DATABASE lms;
USE lms;

-- USERS TABLE (library members / patrons only)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    avatar VARCHAR(500),
    status ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_user_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- STAFF TABLE (admins & librarians who manage the system)
CREATE TABLE staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'LIBRARIAN', 'ASSISTANT') NOT NULL DEFAULT 'LIBRARIAN',
    department VARCHAR(100),
    avatar VARCHAR(500),
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_staff_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- CATEGORIES TABLE
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- BOOKS TABLE
CREATE TABLE books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    isbn VARCHAR(50),
    publisher VARCHAR(100),
    publish_year INT,
    quantity INT DEFAULT 0,
    available INT DEFAULT 0,
    category_id INT,
    cover VARCHAR(500),
    description TEXT,
    added_date DATE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE SET NULL
);

-- BORROW RECORDS TABLE
CREATE TABLE borrow_records (
    borrow_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('BORROWED', 'RETURNED', 'LATE') DEFAULT 'BORROWED',
    librarian_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id)
        ON DELETE CASCADE,
    FOREIGN KEY (librarian_id) REFERENCES staff(staff_id)
        ON DELETE SET NULL
);

-- RETURN RECORDS TABLE
CREATE TABLE return_records (
    return_id INT AUTO_INCREMENT PRIMARY KEY,
    borrow_id INT NOT NULL UNIQUE,
    return_date DATE NOT NULL,
    book_condition ENUM('GOOD', 'DAMAGED', 'LOST') NOT NULL DEFAULT 'GOOD',
    condition_note VARCHAR(255),
    received_by INT,
    FOREIGN KEY (borrow_id) REFERENCES borrow_records(borrow_id)
        ON DELETE CASCADE,
    FOREIGN KEY (received_by) REFERENCES staff(staff_id)
        ON DELETE SET NULL
);

-- FINES TABLE
CREATE TABLE fines (
    fine_id INT AUTO_INCREMENT PRIMARY KEY,
    borrow_id INT NOT NULL UNIQUE,
    amount DECIMAL(10,2),
    reason VARCHAR(255),
    status ENUM('PENDING', 'PAID', 'WAIVED') NOT NULL DEFAULT 'PENDING',
    issued_date DATE,
    paid_date DATE,
    FOREIGN KEY (borrow_id) REFERENCES borrow_records(borrow_id)
        ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA — mirrors what the app currently shows via its
-- built-in mock data, so the UI looks the same on first run,
-- except it's now coming from MySQL.
-- Demo password for every seeded account: password123
-- (plain text, for coursework/demo only — hash it for real use)
-- ============================================================

INSERT INTO categories (category_name, description) VALUES
('Fiction', 'Novels, short stories, and imaginative literature'),
('Science & Technology', 'Books on science, engineering, and technology'),
('History', 'Historical accounts and biographies'),
('Self-Help', 'Personal development and motivational books'),
('Children', 'Books for young readers and children'),
('Philosophy', 'Philosophical works and critical thinking');

INSERT INTO books (title, author, isbn, publisher, publish_year, quantity, available, category_id, cover, description, added_date) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Scribner', 1925, 5, 4, 1, '', 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.', '2024-01-10'),
('A Brief History of Time', 'Stephen Hawking', '978-0-553-38016-3', 'Bantam Books', 1988, 4, 3, 2, '', 'An exploration of cosmology, black holes, and the nature of time.', '2024-01-10'),
('Sapiens', 'Yuval Noah Harari', '978-0-06-231609-7', 'Harper', 2011, 6, 5, 3, '', 'A brief history of humankind from the Stone Age to the present.', '2024-01-10'),
('Atomic Habits', 'James Clear', '978-0-7352-1129-2', 'Avery', 2018, 8, 8, 4, '', 'An easy and proven way to build good habits and break bad ones.', '2024-01-10'),
('To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'J.B. Lippincott', 1960, 5, 4, 1, '', 'A story of racial injustice and the loss of innocence in the American South.', '2024-01-10'),
('The Alchemist', 'Paulo Coelho', '978-0-06-112241-5', 'HarperOne', 1988, 7, 7, 1, '', 'A philosophical novel about a young Andalusian shepherd on a journey to find treasure.', '2024-01-10'),
('Clean Code', 'Robert C. Martin', '978-0-13-235088-4', 'Prentice Hall', 2008, 4, 3, 2, '', 'A handbook of agile software craftsmanship for writing better code.', '2024-01-10'),
('The Little Prince', 'Antoine de Saint-Exupéry', '978-0-15-601219-5', 'Harcourt', 1943, 6, 6, 5, '', 'A poetic tale about a little prince who visits various planets in space.', '2024-01-10');

-- password123
INSERT INTO users (name, email, phone, password, address, avatar, status) VALUES
('Sok Dara', 'dara@example.com', '+855-12-345-101', 'password123', '', '', 'ACTIVE'),
('Chan Sopheak', 'sopheak@example.com', '+855-12-345-102', 'password123', '', '', 'ACTIVE'),
('Mao Sreymom', 'sreymom@example.com', '+855-12-345-103', 'password123', '', '', 'ACTIVE'),
('Heng Vibol', 'vibol@example.com', '+855-12-345-104', 'password123', '', '', 'SUSPENDED'),
('Kim Chenda', 'chenda@example.com', '+855-12-345-105', 'password123', '', '', 'ACTIVE');

-- password123
INSERT INTO staff (name, email, phone, password, role, department, avatar, status) VALUES
('Chhun Sophal', 'sophal@library.com', '+855-12-345-201', 'password123', 'LIBRARIAN', 'Main Library', '', 'ACTIVE'),
('Ros Pisach', 'pisach@library.com', '+855-12-345-202', 'password123', 'LIBRARIAN', 'Reference Section', '', 'ACTIVE'),
('Nov Sreyleak', 'sreyleak@library.com', '+855-12-345-203', 'password123', 'ASSISTANT', 'Children Section', '', 'ACTIVE'),
('Tep Vannak', 'vannak@library.com', '+855-12-345-204', 'password123', 'ASSISTANT', 'Digital Resources', '', 'INACTIVE'),
('Long Rithy', 'admin@library.com', '+855-12-345-301', 'password123', 'ADMIN', 'Administration', '', 'ACTIVE');

INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status, librarian_id) VALUES
(1, 1, '2026-06-15', '2026-06-29', 'BORROWED', 1),  -- 1 Dara / Gatsby
(1, 2, '2026-06-20', '2026-07-04', 'BORROWED', 1),  -- 2 Dara / Brief History
(2, 3, '2026-06-10', '2026-06-24', 'LATE', 1),      -- 3 Sopheak / Sapiens
(4, 5, '2026-05-20', '2026-06-03', 'LATE', 1),      -- 4 Vibol / Mockingbird
(5, 7, '2026-06-25', '2026-07-09', 'BORROWED', 1),  -- 5 Chenda / Clean Code
(3, 4, '2026-06-01', '2026-06-15', 'RETURNED', 1),  -- 6 Sreymom / Atomic Habits
(2, 6, '2026-05-25', '2026-06-08', 'RETURNED', 1),  -- 7 Sopheak / Alchemist
(1, 8, '2026-05-16', '2026-05-30', 'RETURNED', 1),  -- 8 Dara / Little Prince
(3, 4, '2026-06-10', '2026-06-24', 'RETURNED', 1);  -- 9 Sreymom / Atomic Habits (2nd loan)

INSERT INTO return_records (borrow_id, return_date, book_condition, condition_note, received_by) VALUES
(6, '2026-06-14', 'GOOD', 'Returned in excellent condition', 1),
(7, '2026-06-10', 'GOOD', '', 1),
(8, '2026-05-30', 'DAMAGED', 'Cover slightly torn', 1),
(9, '2026-06-16', 'GOOD', '', 1);

INSERT INTO fines (borrow_id, amount, reason, status, issued_date, paid_date) VALUES
(3, 7.50, 'Overdue return (15 days)', 'PENDING', '2026-06-25', NULL),
(4, 25.00, 'Overdue return (35 days)', 'PENDING', '2026-07-08', NULL),
(8, 15.00, 'Damaged book - cover torn', 'PAID', '2026-05-31', '2026-06-05'),
(9, 3.00, 'Overdue return (6 days)', 'WAIVED', '2026-06-16', NULL);
