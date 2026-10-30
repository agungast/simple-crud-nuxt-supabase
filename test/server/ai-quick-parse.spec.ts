import { describe, it, expect } from 'vitest'

describe('AI quick-parse expand', () => {
  it('priority high', () => {
    const lower = 'penting sekali'
    expect(/(tinggi|penting)/.test(lower)).toBe(true)
  })
  it('priority low', () => {
    const lower = 'rendah prioritas'
    expect(/(rendah)/.test(lower)).toBe(true)
  })
  it('hours parse', () => {
    const m = 'estimasi 1.5 jam'.match(/(\d+(?:[.,]\d+)?)\s*(?:jam)/i)
    expect(parseFloat(m![1].replace(',', '.'))).toBe(1.5)
  })
})
