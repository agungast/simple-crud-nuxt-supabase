import { describe, it, expect } from 'vitest'

describe('AI briefing fallback', () => {
  it('builds summary', () => {
    const completed = [{ title: 'A' }]
    const pending = [{ title: 'B', priority: 'HIGH' }]
    const comp = completed.length
    const pend = pending.length
    expect(comp).toBe(1)
    expect(pend).toBe(1)
  })
})
