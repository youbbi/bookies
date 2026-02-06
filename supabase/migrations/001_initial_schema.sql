-- Bookies Database Schema
-- Initial migration: profiles, books, user_books

-- =============================================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with additional profile information
-- =============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- BOOKS TABLE
-- Stores book metadata (cached from Open Library API)
-- =============================================================================
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  open_library_id TEXT UNIQUE, -- e.g., "OL12345W" (work ID)
  isbn TEXT,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  description TEXT,
  publish_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Index for faster lookups
CREATE INDEX idx_books_open_library_id ON books(open_library_id);
CREATE INDEX idx_books_isbn ON books(isbn);

-- =============================================================================
-- USER_BOOKS TABLE
-- Links users to books (their bookshelf)
-- =============================================================================
CREATE TYPE loan_status AS ENUM ('available', 'lent', 'borrowed');

CREATE TABLE user_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,

  -- Loan status
  loan_status loan_status DEFAULT 'available' NOT NULL,
  lent_to_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  borrowed_from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- A user can only have one copy of each book
  UNIQUE(user_id, book_id)
);

-- Enable RLS
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

-- Indexes for common queries
CREATE INDEX idx_user_books_user_id ON user_books(user_id);
CREATE INDEX idx_user_books_book_id ON user_books(book_id);
CREATE INDEX idx_user_books_loan_status ON user_books(loan_status);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- Automatically update the updated_at timestamp
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_books_updated_at
  BEFORE UPDATE ON user_books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
