-- Migration: Add reading_status to user_books for tree bookshelf categorization
-- This enables organizing books into: to_read, reading, read (for tree branches)

-- Add reading_status column to user_books
ALTER TABLE user_books
ADD COLUMN reading_status TEXT
CHECK (reading_status IN ('to_read', 'reading', 'read'))
DEFAULT 'to_read';

-- Create an index for efficient filtering by reading status
CREATE INDEX idx_user_books_reading_status ON user_books(user_id, reading_status);

-- Update existing records to have a default reading status
UPDATE user_books SET reading_status = 'to_read' WHERE reading_status IS NULL;

-- Make the column NOT NULL after backfill
ALTER TABLE user_books ALTER COLUMN reading_status SET NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN user_books.reading_status IS 'Reading progress status: to_read (À lire), reading (En cours), read (Lu)';
