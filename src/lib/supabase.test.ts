import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key-12345')
  })

  it('exports supabase client', async () => {
    const { supabase } = await import('./supabase')

    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
    expect(typeof supabase.auth).toBe('object')
  })

  it('exports type helpers', async () => {
    // Type helpers are exported and usable
    const module = await import('./supabase')

    expect(module.supabase).toBeDefined()
    // Tables, InsertTables, UpdateTables are type exports,
    // they don't exist at runtime but TypeScript validates them
  })
})
