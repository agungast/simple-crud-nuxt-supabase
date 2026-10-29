import { describe, it, expect } from 'vitest'

describe('AI quick-parse fallback', () => {
  it('detects urgent from lower text', () => {
    const lower = 'beli domain besok jam 3 sore prioritas urgent'
    const priority = /(urgen|mendesak)/.test(lower) ? 'URGENT' : 'MEDIUM'
    expect(priority).toBe('URGENT')
  })
  it('extracts estimated hours', () => {
    const prompt = 'estimasi 2 jam'
    const match = prompt.match(/(\d+(?:[.,]\d+)?)\s*(?:jam|hour)/i)
    expect(match ? parseFloat(match[1]) : 0).toBe(2)
  })
})
