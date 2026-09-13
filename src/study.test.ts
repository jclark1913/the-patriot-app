// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { shuffledCopy } from './study'

describe('study shuffle', () => {
  it('keeps all questions exactly once and leaves official order untouched', () => {
    const original = Object.freeze(
      Array.from({ length: 128 }, (_, index) => index + 1),
    )
    const result = shuffledCopy(original, () => 0.25)
    expect(result).toHaveLength(128)
    expect(new Set(result).size).toBe(128)
    expect([...result].sort((a, b) => a - b)).toEqual(original)
    expect(result).not.toEqual(original)
    expect(original[0]).toBe(1)
    expect(original[127]).toBe(128)
  })

  it('handles a single item and an empty list without mutating either', () => {
    expect(shuffledCopy([])).toEqual([])
    expect(shuffledCopy(['only'])).toEqual(['only'])
  })
})
