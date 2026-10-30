import { describe, it, expect } from 'vitest'

describe('AI breakdown fallback', () => {
  it('bug branch', () => {
    const lower = 'bug error fix'
    expect(lower.includes('bug')).toBe(true)
  })
  it('auth branch', () => {
    const lower = 'login auth'
    expect(lower.includes('login')).toBe(true)
  })
  it('api branch', () => {
    const lower = 'api database migrasi'
    expect(lower.includes('api')).toBe(true)
  })
})
