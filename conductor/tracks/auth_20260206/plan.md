# Plan: Authentication System

Track ID: `auth_20260206`

---

## Phase 1: Auth Infrastructure

### 1.1 Supabase Auth Configuration

- [x] Task: Configure Supabase Auth with magic link (email) provider [10f0ec1]
- [x] Task: Configure Supabase Auth with Google OAuth provider [ae06edd]
- [x] Task: Add auth callback route handler for OAuth redirects [2176ba3]

### 1.2 Auth State Management

- [x] Task: Create AuthContext and AuthProvider with session state [75256e9]
- [x] Task: Create useAuth hook exposing user, signIn, signOut, loading [0b51ef8]
- [x] Task: Write tests for useAuth hook [0b51ef8]

- [~] Task: Conductor - User Manual Verification 'Phase 1: Auth Infrastructure' (Protocol in workflow.md)

---

## Phase 2: Auth UI

### 2.1 Sign-In Page

- [ ] Task: Build SignInPage with email input and "Send magic link" button
- [ ] Task: Add "Continue with Google" OAuth button to SignInPage
- [ ] Task: Add loading and success states (email sent confirmation)
- [ ] Task: Write tests for SignInPage component

### 2.2 Display Name Setup

- [ ] Task: Create users profile table with display_name column and RLS policies
- [ ] Task: Build DisplayNamePrompt component (shown on first sign-in)
- [ ] Task: Implement save display name functionality
- [ ] Task: Write tests for DisplayNamePrompt component

### 2.3 Sign Out

- [ ] Task: Add sign out button to app header/menu
- [ ] Task: Implement sign out flow (clear session, redirect to sign-in)
- [ ] Task: Write tests for sign out functionality

- [ ] Task: Conductor - User Manual Verification 'Phase 2: Auth UI' (Protocol in workflow.md)

---

## Phase 3: Protected Routes & Integration

### 3.1 Route Protection

- [ ] Task: Build ProtectedRoute wrapper component
- [ ] Task: Implement redirect to sign-in for unauthenticated users
- [ ] Task: Implement return-to-intended-page after sign-in
- [ ] Task: Write tests for ProtectedRoute component

### 3.2 Integration

- [ ] Task: Wrap app routes with AuthProvider
- [ ] Task: Apply ProtectedRoute to My Shelf and other protected pages
- [ ] Task: Write integration tests for full auth flow

- [ ] Task: Conductor - User Manual Verification 'Phase 3: Protected Routes & Integration' (Protocol in workflow.md)
