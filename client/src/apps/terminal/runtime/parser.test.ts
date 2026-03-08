import { describe, expect, it } from 'vitest'
import { parseCommand, splitInputForAutocomplete } from './parser'

describe('terminal parser', () => {
  it('parses quoted and escaped arguments', () => {
    const parsed = parseCommand(`cat "hello world.txt" docs\\/file`)
    expect(parsed).toEqual({
      name: 'cat',
      args: ['hello world.txt', 'docs/file'],
    })
  })

  it('returns null for empty input', () => {
    expect(parseCommand('   ')).toBeNull()
  })

  it('throws for unterminated quotes', () => {
    expect(() => parseCommand(`cat "broken`)).toThrow('Unterminated quoted argument')
  })

  it('splits autocomplete tokens and trailing-space state', () => {
    expect(splitInputForAutocomplete('cp docs/re')).toEqual({
      tokens: ['cp', 'docs/re'],
      endsWithSpace: false,
    })
    expect(splitInputForAutocomplete('cp docs/ ')).toEqual({
      tokens: ['cp', 'docs/'],
      endsWithSpace: true,
    })
  })
})
