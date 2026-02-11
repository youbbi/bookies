# Plan: GoodReads Import

Track ID: `goodreads_import_20260210`

---

## Phase 1: GoodReads RSS Service [checkpoint: 79bc018]

### 1.1 URL Parser

- [x] Task: Write tests for GoodReads profile URL parser (extract user ID, validate format) [2348c6c]
- [x] Task: Implement GoodReads URL parser utility [2348c6c]

### 1.2 RSS XML Parser

- [x] Task: Write tests for GoodReads RSS XML parser (extract title, author, ISBN, cover, rating, shelf) [90da153]
- [x] Task: Implement RSS XML parser that converts GoodReads RSS items to a GoodReadsBook type [90da153]

### 1.3 RSS Fetch Service

- [x] Task: Create CORS proxy for GoodReads RSS fetching (Vite dev proxy + Vercel API route or Supabase Edge Function) [1769c66]
- [x] Task: Write tests for GoodReads RSS fetch service (fetch all three shelves, handle pagination, handle errors) [1769c66]
- [x] Task: Implement GoodReads RSS fetch service with rate limiting and pagination support [1769c66]

- [x] Task: Conductor - User Manual Verification 'Phase 1: GoodReads RSS Service' (Protocol in workflow.md) [79bc018]

---

## Phase 2: Import Engine

### 2.1 Duplicate Detection

- [ ] Task: Write tests for duplicate detection logic (match by ISBN, open_library_id, title+author)
- [ ] Task: Implement duplicate detection function that checks existing user books

### 2.2 Book Resolution

- [ ] Task: Write tests for book resolution logic (Open Library lookup by ISBN, fallback to search, fallback to raw data)
- [ ] Task: Implement book resolution function using existing Open Library API service

### 2.3 Import Orchestrator

- [ ] Task: Write tests for import orchestrator (batch import with progress tracking, rate limiting, skip duplicates, summary report)
- [ ] Task: Implement import orchestrator that coordinates fetch → resolve → deduplicate → add to shelf

- [ ] Task: Conductor - User Manual Verification 'Phase 2: Import Engine' (Protocol in workflow.md)

---

## Phase 3: Import UI

### 3.1 GoodReads Import Modal

- [ ] Task: Write tests for GoodReadsImportModal component (URL input, validation, progress display, summary display, error states)
- [ ] Task: Build GoodReadsImportModal with URL input view, progress view, and summary view

### 3.2 My Shelf Integration

- [ ] Task: Write tests for import button integration on MyShelfPage
- [ ] Task: Add import floating action button to MyShelfPage and connect GoodReadsImportModal

- [ ] Task: Conductor - User Manual Verification 'Phase 3: Import UI' (Protocol in workflow.md)
