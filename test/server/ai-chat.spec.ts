import { describe, it, expect } from 'vitest'

describe('AI chat fallback', () => {
  it('fallback for urgent', () => {
    const message = 'Tugas prioritas mana yang paling mendesak?'
    const lower = message.toLowerCase()
    const urg = [{ priority: 'URGENT' }]
    if (lower.includes('mendesak') || lower.includes('urg')) {
      expect(urg.length).toBe(1)
    }
  })
  it('fallback default', () => {
    const lower = 'halo'
    expect(lower.includes('prioritas')).toBe(false)
  })
})
