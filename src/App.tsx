import { TreeBookshelf } from '@/components/TreeBookshelf'
import type { UserBookWithBook } from '@/types'

// Helper to create demo book
const createDemoBook = (
  id: string,
  title: string,
  author: string,
  coverId: string,
  readingStatus: 'to_read' | 'reading' | 'read'
): UserBookWithBook => ({
  id,
  user_id: 'demo',
  book_id: `b${id}`,
  loan_status: 'available',
  reading_status: readingStatus,
  lent_to_user_id: null,
  borrowed_from_user_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  book: {
    id: `b${id}`,
    open_library_id: null,
    isbn: null,
    title,
    author,
    cover_url: `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`,
    description: null,
    publish_year: 2020,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
})

// Demo data: Currently reading + Best reads
const demoBooks: UserBookWithBook[] = [
  // Currently reading (upper shelf)
  createDemoBook('1', "L'Étranger", 'Albert Camus', '8231856', 'reading'),
  createDemoBook('2', 'Le Petit Prince', 'Antoine de Saint-Exupéry', '12064472', 'reading'),

  // Best reads / Coups de cœur (lower shelf)
  createDemoBook('3', 'Les Misérables', 'Victor Hugo', '12008429', 'read'),
  createDemoBook('4', 'Germinal', 'Émile Zola', '8406786', 'read'),
  createDemoBook('5', 'Madame Bovary', 'Gustave Flaubert', '8231990', 'read'),
  createDemoBook('6', 'Le Rouge et le Noir', 'Stendhal', '8224779', 'read'),
  createDemoBook('7', 'Candide', 'Voltaire', '8221579', 'read'),
]

function App() {
  return (
    <div className="h-screen overflow-hidden relative">
      <TreeBookshelf
        books={demoBooks}
        onBookClick={(book) => console.log('Clicked:', book.book.title)}
      />
      <div className="tree-bookshelf__overlay">
        <h1 className="tree-bookshelf__title">Bookies</h1>
        <p className="tree-bookshelf__subtitle">Partagez vos livres avec vos proches</p>
      </div>
    </div>
  )
}

export default App
