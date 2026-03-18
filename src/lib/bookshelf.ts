import { supabase } from './supabase'
import type { OpenLibraryBook } from './openLibrary'
import type {
  Book,
  Profile,
  UserBookWithBook,
  LoanRequest,
  LoanRequestWithBook,
  LoanStatus,
  LoanRequestStatus,
  ReadingStatus,
} from '@/types'

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
  rating?: number | null
}

/**
 * Add a book to the user's shelf
 * Creates the book record if it doesn't exist, then adds to user_books
 */
export async function addBookToShelf(
  userId: string,
  openLibraryBook: OpenLibraryBook,
  readingStatus: ReadingStatus = 'reading',
  rating?: number | null
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
    reading_status: readingStatus,
    rating: rating ?? null,
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

/**
 * Update the rating of a book
 */
export async function updateBookRating(userBookId: string, rating: number | null): Promise<void> {
  const { error } = await supabase
    .from('user_books')
    .update({ rating } as never)
    .eq('id', userBookId)

  if (error) {
    throw new Error(`Erreur lors de la mise à jour de la note: ${error.message}`)
  }
}

/**
 * Get a profile by username (for public shelf)
 */
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (error) {
    throw new Error(`Erreur lors du chargement du profil: ${error.message}`)
  }

  return data as Profile | null
}

/**
 * Get available books for a user's public shelf
 */
export async function getPublicShelfBooks(userId: string): Promise<UserBookWithBook[]> {
  const { data, error } = await supabase
    .from('user_books')
    .select('*, book:books(*)')
    .eq('user_id', userId)
    .eq('loan_status', 'available')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erreur lors du chargement: ${error.message}`)
  }

  return (data || []) as unknown as UserBookWithBook[]
}

/**
 * Create a loan request (works with anon key — no auth required)
 */
export async function createLoanRequest(data: {
  user_book_id: string
  owner_id: string
  requester_name: string
  requester_email?: string
  message?: string
}): Promise<LoanRequest> {
  const { data: request, error } = await supabase
    .from('loan_requests')
    .insert({
      user_book_id: data.user_book_id,
      owner_id: data.owner_id,
      requester_name: data.requester_name,
      requester_email: data.requester_email || null,
      message: data.message || null,
    } as never)
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur lors de l'envoi de la demande: ${error.message}`)
  }

  return request as unknown as LoanRequest
}

/**
 * Get pending loan requests for the authenticated owner
 */
export async function getMyLoanRequests(ownerId: string): Promise<LoanRequestWithBook[]> {
  const { data, error } = await supabase
    .from('loan_requests')
    .select('*, user_book:user_books(*, book:books(*))')
    .eq('owner_id', ownerId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erreur lors du chargement des demandes: ${error.message}`)
  }

  return (data || []) as unknown as LoanRequestWithBook[]
}

/**
 * Update a loan request status (accept/decline)
 * When accepted, also marks the book as 'lent'
 */
export async function updateLoanRequestStatus(
  requestId: string,
  status: LoanRequestStatus
): Promise<void> {
  const { data: request, error: fetchError } = await supabase
    .from('loan_requests')
    .select('user_book_id')
    .eq('id', requestId)
    .single()

  if (fetchError) {
    throw new Error(`Erreur: ${fetchError.message}`)
  }

  const { error } = await supabase
    .from('loan_requests')
    .update({ status } as never)
    .eq('id', requestId)

  if (error) {
    throw new Error(`Erreur lors de la mise à jour: ${error.message}`)
  }

  if (status === 'accepted' && request) {
    await updateLoanStatus((request as { user_book_id: string }).user_book_id, 'lent')
  }
}
