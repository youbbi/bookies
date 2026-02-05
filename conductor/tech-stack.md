# Tech Stack: Bookies

## Overview
A modern, lightweight stack optimized for rapid MVP development of a mobile-first PWA.

## Frontend

### Framework
- **React 18** with **Vite** as the build tool
- TypeScript for type safety
- PWA capabilities via `vite-plugin-pwa`

### Styling
- **Tailwind CSS** for utility-first styling
- Custom color palette for warm, cozy aesthetic
- CSS custom properties for theming

### Key Libraries
- `react-router-dom` - Client-side routing
- `@tanstack/react-query` - Server state management and caching
- `zustand` or `jotai` - Lightweight client state (if needed)
- `react-hook-form` - Form handling
- `quagga2` or `@aspect/barcode-scanner` - ISBN barcode scanning

## Backend

### Platform
- **Supabase** (Backend-as-a-Service)
  - PostgreSQL database
  - Built-in authentication (email, OAuth)
  - Row-level security for data protection
  - Real-time subscriptions for live updates
  - Storage for user avatars (if needed)

### Database Schema (High-level)
- `users` - User profiles and settings
- `books` - Book records (linked to Open Library IDs)
- `user_books` - User's bookshelf (ownership, status, availability)
- `friendships` - Friend connections
- `borrow_requests` - Lending transactions and messages

## External APIs

### Book Data
- **Open Library API** (https://openlibrary.org/developers/api)
  - Book search by title, author, ISBN
  - Cover images via covers.openlibrary.org
  - No API key required
  - Free and open-source

## Deployment & Infrastructure

### Hosting
- **Vercel** for frontend deployment
  - Automatic deployments from Git
  - Preview deployments for PRs
  - Edge functions if needed

### Supabase
- Supabase Cloud (managed)
- Free tier sufficient for MVP

## Development Tools

### Code Quality
- ESLint + Prettier
- TypeScript strict mode
- Husky for pre-commit hooks

### Testing
- Vitest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests (optional for MVP)

## PWA Features
- Service worker for offline support
- App manifest for installability
- Push notifications (future consideration)
