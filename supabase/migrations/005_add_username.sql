-- Add username column to profiles for public shelf URLs
ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;

-- Username must be 3-30 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphens
ALTER TABLE profiles ADD CONSTRAINT username_format
  CHECK (username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$');

CREATE UNIQUE INDEX idx_profiles_username ON profiles(username);

-- Backfill existing profiles: slugify display_name, fallback to first 8 chars of id
UPDATE profiles
SET username = CASE
  WHEN display_name IS NOT NULL AND length(trim(display_name)) >= 3
    THEN lower(regexp_replace(trim(display_name), '[^a-z0-9]+', '-', 'gi'))
  ELSE 'user-' || left(id::text, 8)
END
WHERE username IS NULL;
