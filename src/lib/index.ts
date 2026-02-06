// Re-export all library utilities from this file
export { supabase } from './supabase'
export type { Tables, InsertTables, UpdateTables } from './supabase'

export { searchBooks, lookupByIsbn, getCoverUrl, getCoverUrlByIsbn } from './openLibrary'
export type { OpenLibraryBook, OpenLibrarySearchResult } from './openLibrary'

export { addBookToShelf, removeBookFromShelf, getUserBooks, updateLoanStatus } from './bookshelf'
