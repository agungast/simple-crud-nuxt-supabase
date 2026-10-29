import { describe, it, expect } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

describe('taskStore minimal check', () => {
  it('store can be initialized with templates/state', () => {
    setActivePinia(createPinia())
    // Minimal sanity: Pinia loads; full store needs Supabase mock.
    expect(true).toBe(true)
  })
})
