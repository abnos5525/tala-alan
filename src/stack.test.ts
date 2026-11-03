import { expect, test } from 'vitest'
import Decimal from 'decimal.js'
import { z } from 'zod'

test('decimal and zod are available to later steps', () => {
  const value = z.string().regex(/^\d+$/).parse('10')
  expect(new Decimal(value).toFixed()).toBe('10')
})
