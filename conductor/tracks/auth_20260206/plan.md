# Plan: Authentication System

Track ID: `auth_20260206`

---

## Phase 1: Auth Infrastructure [checkpoint: 1505aae]

### 1.1 Supabase Auth Configuration

- [x] Task: Configure Supabase Auth with magic link (email) provider [10f0ec1]
- [x] Task: Configure Supabase Auth with Google OAuth provider [ae06edd]
- [x] Task: Add auth callback route handler for OAuth redirects [2176ba3]

### 1.2 Auth State Management

- [x] Task: Create AuthContext and AuthProvider with session state [75256e9]
- [x] Task: Create useAuth hook exposing user, signIn, signOut, loading [0b51ef8]
- [x] Task: Write tests for useAuth hook [0b51ef8]

- [x] Task: Conductor - User Manual Verification 'Phase 1: Auth Infrastructure' (Protocol in workflow.md) [1505aae]

---

## Phase 2: Auth UI [checkpoint: b115f80]

### 2.1 Sign-In Page

- [x] Task: Build SignInPage with email input and "Send magic link" button [a1e436d]
- [x] Task: Add "Continue with Google" OAuth button to SignInPage [0904d33]
- [x] Task: Add loading and success states (email sent confirmation) [a1e436d]
- [x] Task: Write tests for SignInPage component [a1e436d]

### 2.2 Display Name Setup

- [x] Task: Create users profile table with display_name column and RLS policies [001_initial_schema.sql]
- [x] Task: Build DisplayNamePrompt component (shown on first sign-in) [7236633]
- [x] Task: Implement save display name functionality [7236633]
- [x] Task: Write tests for DisplayNamePrompt component [7236633]

### 2.3 Sign Out

- [x] Task: Add sign out button to app header/menu [2f8009d]
- [x] Task: Implement sign out flow (clear session, redirect to sign-in) [2f8009d]
- [x] Task: Write tests for sign out functionality [2f8009d]

- [x] Task: Conductor - User Manual Verification 'Phase 2: Auth UI' (Protocol in workflow.md) [b115f80]

---

## Phase 3: Protected Routes & Integration [checkpoint: 2c5f82f]

### 3.1 Route Protection

- [x] Task: Build ProtectedRoute wrapper component [a96e56a]
- [x] Task: Implement redirect to sign-in for unauthenticated users [a96e56a]
- [x] Task: Implement return-to-intended-page after sign-in [a96e56a]
- [x] Task: Write tests for ProtectedRoute component [a96e56a]

### 3.2 Integration

- [x] Task: Wrap app routes with AuthProvider [9d640c3]
- [x] Task: Apply ProtectedRoute to My Shelf and other protected pages [9d640c3]
- [x] Task: Write integration tests for full auth flow [9d640c3]

- [x] Task: Conductor - User Manual Verification 'Phase 3: Protected Routes & Integration' (Protocol in workflow.md) [2c5f82f]
