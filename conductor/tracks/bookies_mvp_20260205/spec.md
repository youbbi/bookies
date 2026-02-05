# Spec: Bookies MVP

## Overview
Bookies is a trusted book lending platform for friends and family. Users can build personal bookshelves, connect with friends via invite links, and coordinate book lending within their trusted circle.

## Target Users
**Casual readers** who read a few books per year and want a simple way to share books with people they know and trust.

## Core Value Propositions
1. **Trust-based sharing** - Lending within personal networks feels safe
2. **Simplicity first** - No complexity, just clean book sharing

## Platform
Mobile-first Progressive Web App (PWA) built with React + Vite, Supabase backend, deployed on Vercel.

---

## Functional Requirements

### FR1: Personal Bookshelf
- Users can search for books via Open Library API (by title, author, or ISBN)
- Users can scan book barcodes to add books (ISBN lookup)
- Books display cover image, title, author
- Users can remove books from their shelf
- Books show loan status: available, "Emprunté par [ami]", "Emprunté de [ami]"

### FR2: Authentication
- Users can sign up / sign in with email + password
- Users can sign in with Google OAuth
- Session persists across browser sessions
- Users can sign out
- Protected routes redirect unauthenticated users to sign-in

### FR3: Book Ratings
- Users can rate books (1-5 stars)
- Users can write mini-reviews (optional, max 280 characters)
- Average rating displays on book cards
- Friend ratings shown on book detail view

### FR4: Public Discovery View
- Unauthenticated users can browse:
  - "Disponible à emprunter" shelf (books available from all users)
  - "Les mieux notés" shelf (highest-rated books)
- Book cards show cover, title, author, average rating, owner
- Clicking a book prompts sign-in to request borrow
- Clear call-to-action to sign up

### FR5: Friend Connections
- Users can generate shareable invite links
- Invite links can be shared via any channel (text, email, etc.)
- Recipients click link → sign up/sign in → connection established
- Users can view their friends list
- Users can remove friends
- Users can browse each friend's bookshelf

### FR6: Borrow Request Flow
- Users can request to borrow a book from a friend
- Book owner receives notification of request
- Owner can approve or decline request
- Upon approval, book status changes to "Emprunté par [borrower]"
- Borrower sees book as "Emprunté de [owner]"
- Owner can mark book as returned
- Coordination (pickup, return) happens offline

---

## Non-Functional Requirements

### NFR1: Performance
- Initial page load < 3 seconds on 4G
- Book search results appear within 1 second
- Smooth 60fps scrolling on book shelves

### NFR2: Mobile Experience
- Touch targets minimum 44x44px
- Responsive design works on all screen sizes
- PWA installable on home screen
- Works offline for viewing own bookshelf (cached data)

### NFR3: Accessibility
- WCAG AA color contrast compliance
- Alt text on all book covers
- Keyboard navigable

### NFR4: Security
- Row-level security on all Supabase tables
- No sensitive data exposed in client
- Secure authentication flows

---

## UI/UX Guidelines

### Visual Style
- Warm, cozy palette: creams, soft browns, wood tones
- Real book covers as primary visual elements
- Subtle shadows, rounded corners
- Bookshelf metaphor with warm touches

### Language
- Primary language: French
- Tone: Warm yet concise ("Bon retour!", not verbose)

### Interaction
- Tap-focused clarity (no hidden gestures)
- Minimal onboarding (let users explore)
- Clear status badges on book cards

---

## Out of Scope (MVP)
- Reading status tracking (read, reading, want-to-read)
- In-app messaging
- Push notifications
- Multiple languages
- Book clubs / group features
- Import from Goodreads or other services
