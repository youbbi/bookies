# Spec: GoodReads Import

Track ID: `goodreads_import_20260210`

---

## Overview

Allow users to import their existing GoodReads library into Bookies by pasting their GoodReads profile URL. The app fetches the user's books via GoodReads' public RSS feeds (no API key required) and adds them to their Bookies bookshelf, mapping GoodReads shelves to Bookies reading statuses.

## Functional Requirements

### FR-1: Profile URL Input

- User provides their GoodReads profile URL (e.g., `https://www.goodreads.com/user/show/12345-username`)
- The system extracts the numeric user ID from the URL
- Validate the URL format before proceeding
- Display clear instructions: "Paste your GoodReads profile URL. Make sure your shelves are set to public on GoodReads."

### FR-2: RSS Feed Fetching

- Fetch books from three GoodReads RSS feeds:
  - `https://www.goodreads.com/review/list_rss/{USER_ID}?shelf=read`
  - `https://www.goodreads.com/review/list_rss/{USER_ID}?shelf=currently-reading`
  - `https://www.goodreads.com/review/list_rss/{USER_ID}?shelf=to-read`
- Handle pagination if the RSS feed is paginated (fetch all pages)
- Parse XML response to extract: title, author, ISBN, cover image URL, user rating (1-5)
- Use a CORS proxy or Supabase Edge Function to fetch RSS feeds (browser cannot fetch cross-origin XML directly)

### FR-3: Shelf Mapping

Map GoodReads shelves to Bookies `reading_status`:

| GoodReads Shelf     | Bookies `reading_status` |
| ------------------- | ------------------------ |
| `read`              | `read`                   |
| `currently-reading` | `reading`                |
| `to-read`           | `to_read`                |

All imported books get `loan_status: 'available'` by default.

### FR-4: Book Resolution

- For each book from the RSS feed:
  1. If ISBN is available, look up the book via Open Library API (`lookupByIsbn`) to get a complete `OpenLibraryBook` record
  2. If no ISBN, search by title + author via Open Library API (`searchBooks`) and use the best match
  3. If Open Library returns no results, create a book record directly from the RSS data (title, author, cover URL)
- Use the existing `addBookToShelf` function to add books to the user's shelf

### FR-5: Duplicate Handling

- Before adding a book, check if it already exists on the user's Bookies shelf
- Match by: book `isbn` first, then `open_library_id`, then `title + author` (case-insensitive)
- If duplicate found: **skip** the book and keep the existing Bookies entry
- Track skipped duplicates to report in the summary

### FR-6: Import Progress & Summary

- Show a progress indicator during import (e.g., "Importing book 12 of 47...")
- After import completes, show a summary:
  - Total books found on GoodReads
  - Books successfully imported
  - Books skipped (duplicates)
  - Books that failed to import (with reasons)
- Allow user to dismiss the summary and see their updated shelf

### FR-7: UI — Import Button on My Shelf Page

- Add an "Import" button on the My Shelf page alongside the existing Search and Scanner floating action buttons
- Tapping the button opens a modal (`GoodReadsImportModal`) with:
  1. Brief instructions on how to find their GoodReads profile URL
  2. A text input for the URL
  3. An "Import" button to start the process
  4. Progress and summary views within the same modal

## Non-Functional Requirements

- **NFR-1:** Import should handle libraries of up to 500 books without timeout
- **NFR-2:** Rate-limit Open Library API calls to avoid being blocked (e.g., max 1 request per 100ms)
- **NFR-3:** If RSS feed is private/inaccessible, show a clear error: "Could not access your GoodReads library. Please make sure your profile and shelves are set to public."

## Acceptance Criteria

- [ ] User can paste a GoodReads profile URL and import all books from read, currently-reading, and to-read shelves
- [ ] GoodReads shelves are correctly mapped to Bookies reading statuses
- [ ] Duplicate books already on the Bookies shelf are skipped
- [ ] Progress indicator shows during import
- [ ] Summary displays imported/skipped/failed counts after completion
- [ ] Error message shown for private or invalid profiles
- [ ] Import button is accessible from the My Shelf page

## Out of Scope

- Importing GoodReads ratings/reviews into Bookies (Bookies rating system not yet built)
- Importing custom GoodReads shelves beyond the three standard ones
- CSV file upload as an alternative import method
- Syncing — this is a one-time import, not an ongoing sync
- Importing friends/social connections from GoodReads
