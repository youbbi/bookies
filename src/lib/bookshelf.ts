import { supabase } from './supabase'
import type { OpenLibraryBook } from './openLibrary'
import type { Book, UserBookWithBook, LoanStatus, ReadingStatus } from '@/types'

// Type for book insert operations
type BookInsert = {
  open_library_id: string | null
  isbn: string | null
  title: string
  author: string | null
  cover_url: string | null
  description: string | null
  publish_year: number | null
}

// Type for user_books insert operations
type UserBookInsert = {
  user_id: string
  book_id: string
  loan_status: LoanStatus
  reading_status: ReadingStatus
}

/**
 * Add a book to the user's shelf
 * Creates the book record if it doesn't exist, then adds to user_books
 */
export async function addBookToShelf(
  userId: string,
  openLibraryBook: OpenLibraryBook
): Promise<UserBookWithBook> {
  // First, check if book already exists by open_library_id
  let book: Book | null = null

  const { data: existingBook } = await supabase
    .from('books')
    .select('*')
    .eq('open_library_id', openLibraryBook.key)
    .maybeSingle()

  if (existingBook) {
    book = existingBook as Book
  } else {
    // Create the book
    const bookData: BookInsert = {
      open_library_id: openLibraryBook.key,
      isbn: openLibraryBook.isbn || null,
      title: openLibraryBook.title,
      author: openLibraryBook.authors?.join(', ') || null,
      cover_url: openLibraryBook.coverUrl || null,
      description: openLibraryBook.description || null,
      publish_year: openLibraryBook.publishYear || null,
    }

    const { data: newBook, error: bookError } = await supabase
      .from('books')
      .insert(bookData as never)
      .select()
      .single()

    if (bookError) {
      throw new Error(`Erreur lors de l'ajout du livre: ${bookError.message}`)
    }

    book = newBook as Book
  }

  // Check if user already has this book
  const { data: existingUserBook } = await supabase
    .from('user_books')
    .select('*, book:books(*)')
    .eq('user_id', userId)
    .eq('book_id', book.id)
    .maybeSingle()

  if (existingUserBook) {
    // Book already in shelf
    return existingUserBook as unknown as UserBookWithBook
  }

  // Add to user's shelf
  const userBookData: UserBookInsert = {
    user_id: userId,
    book_id: book.id,
    loan_status: 'available',
    reading_status: 'reading',
  }

  const { data: userBook, error: userBookError } = await supabase
    .from('user_books')
    .insert(userBookData as never)
    .select('*, book:books(*)')
    .single()

  if (userBookError) {
    throw new Error(`Erreur lors de l'ajout à la bibliothèque: ${userBookError.message}`)
  }

  return userBook as unknown as UserBookWithBook
}

/**
 * Remove a book from the user's shelf
 */
export async function removeBookFromShelf(userBookId: string): Promise<void> {
  const { error } = await supabase.from('user_books').delete().eq('id', userBookId)

  if (error) {
    throw new Error(`Erreur lors de la suppression: ${error.message}`)
  }
}

/**
 * Get all books on the user's shelf
 */
export async function getUserBooks(userId: string): Promise<UserBookWithBook[]> {
  const { data, error } = await supabase
    .from('user_books')
    .select('*, book:books(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erreur lors du chargement: ${error.message}`)
  }

  return (data || []) as unknown as UserBookWithBook[]
}

/**
 * Update the loan status of a book
 */
export async function updateLoanStatus(
  userBookId: string,
  loanStatus: LoanStatus,
  lentToUserId?: string | null
): Promise<void> {
  const updateData = {
    loan_status: loanStatus,
    lent_to_user_id: lentToUserId || null,
  }

  const { error } = await supabase
    .from('user_books')
    .update(updateData as never)
    .eq('id', userBookId)

  if (error) {
    throw new Error(`Erreur lors de la mise à jour: ${error.message}`)
  }
}

/**
 * Update the reading status of a book
 */
export async function updateReadingStatus(
  userBookId: string,
  readingStatus: ReadingStatus
): Promise<void> {
  const { error } = await supabase
    .from('user_books')
    .update({ reading_status: readingStatus } as never)
    .eq('id', userBookId)

  if (error) {
    throw new Error(`Erreur lors de la mise à jour: ${error.message}`)
  }
}
