-- Migration: Add rating column to user_books
-- Allows users to rate books 1-5 stars

ALTER TABLE user_books
ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Index for queries filtering by rating (e.g., show all 5-star books)
CREATE INDEX idx_user_books_rating ON user_books(user_id, rating);
