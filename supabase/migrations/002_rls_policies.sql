-- Bookies Row Level Security Policies
-- Migration: RLS policies for profiles, books, and user_books

-- =============================================================================
-- PROFILES RLS POLICIES
-- =============================================================================

-- Users can read any profile (for friend features)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profiles are created automatically via trigger, no insert policy needed

-- =============================================================================
-- BOOKS RLS POLICIES
-- =============================================================================

-- Anyone can read books (public catalog)
CREATE POLICY "Books are viewable by everyone"
  ON books FOR SELECT
  USING (true);

-- Any authenticated user can insert books
-- (when they add a book to their shelf, we may need to create the book record)
CREATE POLICY "Authenticated users can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Books are generally not updated or deleted directly
-- (book metadata is cached from Open Library)

-- =============================================================================
-- USER_BOOKS RLS POLICIES
-- =============================================================================

-- Users can see their own books
CREATE POLICY "Users can view their own books"
  ON user_books FOR SELECT
  USING (auth.uid() = user_id);

-- Users can see books of other users (for friend browsing and public discovery)
-- This enables the "Disponible à emprunter" and friend shelf features
CREATE POLICY "Users can view other users' books"
  ON user_books FOR SELECT
  USING (true);

-- Users can add books to their own shelf
CREATE POLICY "Users can add books to their shelf"
  ON user_books FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own books (change loan status, etc.)
CREATE POLICY "Users can update their own books"
  ON user_books FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can remove books from their own shelf
CREATE POLICY "Users can delete their own books"
  ON user_books FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- NOTES ON RLS
-- =============================================================================
-- - RLS is enabled on all tables in 001_initial_schema.sql
-- - Profiles: readable by all, updatable only by owner
-- - Books: readable by all, insertable by authenticated users
-- - User_books: full CRUD for owner, readable by all (for discovery/friends)
--
-- Future considerations:
-- - Add friend-based restrictions for borrowing
-- - Rate limiting on book inserts
-- - Admin policies for moderation
