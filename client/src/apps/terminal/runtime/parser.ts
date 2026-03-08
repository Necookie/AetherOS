import type { ParsedCommand } from './types'

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim()
  if (!trimmed) {
    return null
  }

  const tokens: string[] = []
  let token = ''
  let quote: '"' | "'" | null = null
  let escape = false

  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index]

    if (escape) {
      token += char
      escape = false
      continue
    }

    if (char === '\\') {
      escape = true
      continue
    }

    if (quote) {
      if (char === quote) {
        quote = null
      } else {
        token += char
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (/\s/.test(char)) {
      if (token.length > 0) {
        tokens.push(token)
        token = ''
      }
      continue
    }

    token += char
  }

  if (escape) {
    token += '\\'
  }

  if (quote) {
    throw new Error('Unterminated quoted argument')
  }

  if (token.length > 0) {
    tokens.push(token)
  }

  if (tokens.length === 0) {
    return null
  }

  return {
    name: tokens[0],
    args: tokens.slice(1),
  }
}

export function splitInputForAutocomplete(input: string): { tokens: string[]; endsWithSpace: boolean } {
  const endsWithSpace = /\s$/.test(input)
  const tokens = input.trimStart().split(/\s+/).filter(Boolean)
  return { tokens, endsWithSpace }
}
