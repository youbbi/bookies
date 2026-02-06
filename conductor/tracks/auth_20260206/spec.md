# Spec: Authentication System

Track ID: `auth_20260206`

## Overview

Implement a passwordless authentication system for Bookies using Supabase Auth. Users can sign in via magic link (email) or Google OAuth. New users are prompted to set a display name on first sign-in before being directed to their bookshelf.

## Functional Requirements

### FR-1: Magic Link Authentication

- User enters email address on sign-in page
- System sends a magic link to the email via Supabase Auth
- Clicking the link authenticates the user and redirects to the app
- Link expires after 1 hour (Supabase default)

### FR-2: Google OAuth Authentication

- User clicks "Continue with Google" button
- System initiates OAuth flow via Supabase Auth
- On success, user is authenticated and redirected to the app

### FR-3: First-Time User Setup

- After first successful authentication, detect if user has no display name set
- Prompt user to enter a display name (required, 2-30 characters)
- Save display name to user profile in database
- Redirect to My Shelf page

### FR-4: Returning User Flow

- Authenticated users with existing profile redirect directly to My Shelf
- Session persists across browser sessions (Supabase default behavior)

### FR-5: Sign Out

- User can sign out from a menu/button in the app
- Clears session and redirects to sign-in page

### FR-6: Protected Routes

- Certain routes require authentication (My Shelf, Friends, etc.)
- Unauthenticated users accessing protected routes are redirected to sign-in
- After sign-in, user returns to originally requested page

## Non-Functional Requirements

### NFR-1: Mobile-First UI

- Sign-in page optimized for mobile screens
- Large touch targets for buttons (44x44px minimum)
- Email input uses appropriate mobile keyboard type

### NFR-2: Security

- All auth handled by Supabase (no custom token management)
- Row Level Security policies enforce user data isolation

## Acceptance Criteria

- [ ] User can request a magic link and sign in via email
- [ ] User can sign in with Google OAuth
- [ ] New users are prompted to set display name before accessing app
- [ ] Returning users go directly to My Shelf
- [ ] User can sign out
- [ ] Protected routes redirect unauthenticated users to sign-in
- [ ] All auth flows work on mobile browsers

## Out of Scope

- Password-based authentication
- Email verification for magic links (handled by Supabase)
- Profile photo/avatar upload
- Account deletion
- Password reset (not applicable - passwordless)
- Social auth providers other than Google
