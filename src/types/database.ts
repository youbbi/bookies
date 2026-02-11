// Database types matching the Supabase schema
// These types are manually maintained to match supabase/migrations/

export type LoanStatus = 'available' | 'lent' | 'borrowed'

export type ReadingStatus = 'to_read' | 'reading' | 'read'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Book {
  id: string
  open_library_id: string | null
  isbn: string | null
  title: string
  author: string | null
  cover_url: string | null
  description: string | null
  publish_year: number | null
  created_at: string
  updated_at: string
}

export interface UserBook {
  id: string
  user_id: string
  book_id: string
  loan_status: LoanStatus
  reading_status: ReadingStatus
  rating: number | null
  lent_to_user_id: string | null
  borrowed_from_user_id: string | null
  created_at: string
  updated_at: string
}

// Joined types for common queries
export interface UserBookWithBook extends UserBook {
  book: Book
}

export interface UserBookWithDetails extends UserBook {
  book: Book
  lent_to: Profile | null
  borrowed_from: Profile | null
}

// Database schema type for Supabase client
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      books: {
        Row: Book
        Insert: Omit<Book, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Book, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      user_books: {
        Row: UserBook
        Insert: Omit<UserBook, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserBook, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      loan_status: LoanStatus
      reading_status: ReadingStatus
    }
    CompositeTypes: Record<string, never>
  }
}
