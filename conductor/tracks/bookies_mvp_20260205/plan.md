# Plan: Bookies MVP

Track ID: `bookies_mvp_20260205`

---

## Phase 1: Personal Bookshelf

### 1.1 Project Setup

- [x] Task: Initialize React + Vite + TypeScript project with PWA plugin [74b381a]
- [x] Task: Configure Tailwind CSS with custom warm color palette [4cf636d]
- [x] Task: Set up ESLint, Prettier, and Husky pre-commit hooks [e8826f4]
- [x] Task: Create base folder structure (components, pages, hooks, lib, types) [ee6c1f8]
- [x] Task: Configure Vitest and React Testing Library [9c3ac52]

### 1.2 Supabase Setup

- [x] Task: Create Supabase project and configure environment variables [3b0b444]
- [x] Task: Design and create database schema (users, books, user_books) [0b224c2]
- [x] Task: Set up Row Level Security policies for user_books table [ac6d050]
- [x] Task: Create Supabase client utility with TypeScript types [088046c]

### 1.3 Book Search & Add

- [x] Task: Create Open Library API service (search by title/author, lookup by ISBN) [f99aa25]
- [x] Task: Build BookSearchModal component with search input and results list [ba622ff]
- [ ] Task: Build BookCard component with cover, title, author, and status badge
- [ ] Task: Implement add book to shelf functionality (insert to user_books)
- [ ] Task: Write tests for Open Library API service
- [ ] Task: Write tests for BookSearchModal component

### 1.4 Bookshelf Display

- [ ] Task: Build BookShelf component (horizontal scrollable list of BookCards)
- [ ] Task: Build MyShelfPage displaying user's books grouped by status
- [ ] Task: Implement remove book from shelf functionality
- [ ] Task: Add empty state for shelf ("Rien ici pour l'instant.")
- [ ] Task: Write tests for BookShelf and MyShelfPage components

### 1.5 Barcode Scanning

- [ ] Task: Integrate barcode scanning library (quagga2 or similar)
- [ ] Task: Build BarcodeScannerModal component
- [ ] Task: Connect barcode scan result to Open Library ISBN lookup
- [ ] Task: Write tests for barcode scanning flow

- [ ] Task: Conductor - User Manual Verification 'Phase 1: Personal Bookshelf' (Protocol in workflow.md)

---

## Phase 2: Authentication

### 2.1 Auth Setup

- [ ] Task: Configure Supabase Auth with email/password provider
- [ ] Task: Configure Supabase Auth with Google OAuth provider
- [ ] Task: Create AuthContext and useAuth hook for session management
- [ ] Task: Write tests for useAuth hook

### 2.2 Auth UI

- [ ] Task: Build SignInPage with email/password form and Google button
- [ ] Task: Build SignUpPage with email/password registration form
- [ ] Task: Implement protected route wrapper component
- [ ] Task: Add sign out functionality to user menu
- [ ] Task: Write tests for auth pages and protected routes

### 2.3 User Profile

- [ ] Task: Create users table trigger to create profile on signup
- [ ] Task: Build basic user profile display (name, avatar initials)
- [ ] Task: Write tests for user profile functionality

- [ ] Task: Conductor - User Manual Verification 'Phase 2: Authentication' (Protocol in workflow.md)

---

## Phase 3: Book Ratings & UI Polish

### 3.1 Ratings System

- [ ] Task: Add ratings table to database schema (user_id, book_id, stars, review)
- [ ] Task: Set up RLS policies for ratings table
- [ ] Task: Build StarRating component (display and input modes)
- [ ] Task: Build RatingModal for submitting rating and optional review
- [ ] Task: Calculate and display average rating on BookCard
- [ ] Task: Write tests for rating components and logic

### 3.2 Book Detail View

- [ ] Task: Build BookDetailPage with full cover, metadata, and ratings
- [ ] Task: Display friend ratings and reviews on book detail
- [ ] Task: Add "Noter ce livre" button to trigger RatingModal
- [ ] Task: Write tests for BookDetailPage

### 3.3 UI Polish

- [ ] Task: Implement warm color palette throughout app (cream, brown, wood tones)
- [ ] Task: Add subtle shadows, rounded corners to all cards
- [ ] Task: Create cozy bookshelf visual elements (wood texture shelf)
- [ ] Task: Ensure consistent typography (sans-serif UI, optional serif headings)
- [ ] Task: Add loading states and skeleton screens
- [ ] Task: Verify WCAG AA color contrast compliance

- [ ] Task: Conductor - User Manual Verification 'Phase 3: Book Ratings & UI Polish' (Protocol in workflow.md)

---

## Phase 4: Public Discovery View

### 4.1 Public Shelves

- [ ] Task: Create database view for publicly available books
- [ ] Task: Create database view for top-rated books
- [ ] Task: Build DiscoverPage with "Disponible à emprunter" shelf
- [ ] Task: Build "Les mieux notés" shelf on DiscoverPage
- [ ] Task: Ensure DiscoverPage is accessible without authentication
- [ ] Task: Write tests for public shelves and DiscoverPage

### 4.2 Sign-up Prompts

- [ ] Task: Add sign-up CTA banner on DiscoverPage
- [ ] Task: Clicking book actions (borrow, rate) prompts sign-in modal
- [ ] Task: After sign-in, redirect user back to intended action
- [ ] Task: Write tests for sign-up prompt flows

- [ ] Task: Conductor - User Manual Verification 'Phase 4: Public Discovery View' (Protocol in workflow.md)

---

## Phase 5: Friend Connections

### 5.1 Invite System

- [ ] Task: Create friendships table (user_id, friend_id, status, invite_token)
- [ ] Task: Set up RLS policies for friendships table
- [ ] Task: Build invite link generation functionality
- [ ] Task: Build InviteFriendModal with shareable link and copy button
- [ ] Task: Write tests for invite generation

### 5.2 Accept Invite Flow

- [ ] Task: Create /invite/[token] route for accepting invites
- [ ] Task: Handle invite acceptance (create friendship on both sides)
- [ ] Task: Show success message and redirect to friend's shelf
- [ ] Task: Handle invalid/expired invite tokens gracefully
- [ ] Task: Write tests for invite acceptance flow

### 5.3 Friends List & Browsing

- [ ] Task: Build FriendsPage listing all connected friends
- [ ] Task: Build FriendShelfPage to browse a friend's bookshelf
- [ ] Task: Add friend avatar circles component (as shown in UI reference)
- [ ] Task: Implement remove friend functionality
- [ ] Task: Write tests for friends list and browsing

- [ ] Task: Conductor - User Manual Verification 'Phase 5: Friend Connections' (Protocol in workflow.md)

---

## Phase 6: Borrow Request Flow

### 6.1 Request System

- [ ] Task: Create borrow_requests table (book_id, borrower_id, owner_id, status)
- [ ] Task: Set up RLS policies for borrow_requests table
- [ ] Task: Build "Emprunter" button on friend's book cards
- [ ] Task: Implement create borrow request functionality
- [ ] Task: Write tests for borrow request creation

### 6.2 Owner Actions

- [ ] Task: Build notifications/requests view for pending requests
- [ ] Task: Implement approve request functionality (updates book status)
- [ ] Task: Implement decline request functionality
- [ ] Task: Build "Marquer comme retourné" functionality for owner
- [ ] Task: Write tests for owner actions

### 6.3 Status Display

- [ ] Task: Update BookCard to show "Emprunté par [ami]" badge
- [ ] Task: Update BookCard to show "Emprunté de [ami]" badge
- [ ] Task: Build ActiveLoansPage showing books lent and borrowed
- [ ] Task: Write tests for loan status display

- [ ] Task: Conductor - User Manual Verification 'Phase 6: Borrow Request Flow' (Protocol in workflow.md)

---

## Phase 7: Final Polish & Deployment

### 7.1 PWA Configuration

- [ ] Task: Configure app manifest (name, icons, theme color)
- [ ] Task: Set up service worker for offline caching
- [ ] Task: Test PWA installation on iOS and Android
- [ ] Task: Write tests for offline functionality

### 7.2 Performance & Testing

- [ ] Task: Run Lighthouse audit and fix any issues
- [ ] Task: Ensure all pages load under 3 seconds on 4G
- [ ] Task: Run full E2E test suite
- [ ] Task: Fix any remaining bugs from testing

### 7.3 Deployment

- [ ] Task: Configure Vercel project and environment variables
- [ ] Task: Set up production Supabase instance
- [ ] Task: Deploy to production
- [ ] Task: Verify production deployment works correctly
- [ ] Task: Run smoke tests on production

- [ ] Task: Conductor - User Manual Verification 'Phase 7: Final Polish & Deployment' (Protocol in workflow.md)
