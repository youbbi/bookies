-- Add book format to distinguish physical books, ebooks, and library books
-- Only physical books should be lendable

CREATE TYPE book_format AS ENUM ('physical', 'ebook', 'library');

ALTER TABLE user_books
  ADD COLUMN book_format book_format DEFAULT 'physical' NOT NULL,
  ADD COLUMN location TEXT;
