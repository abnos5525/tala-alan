import Decimal from 'decimal.js'
import { z } from 'zod'

const positiveDecimal = /^(?:0|[1-9]\d*)(?:\.\d+)?$/

export function priceString(value: number): string | null {
  if (!Number.isFinite(value) || value <= 0) return null
  const text = value.toString()
  if (!positiveDecimal.test(text)) return null
  const decimal = new Decimal(text)
  if (!decimal.isFinite() || decimal.lte(0)) return null
  return decimal.toFixed()
}

export function utcTimestamp(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const withZone = /(?:Z|[+-]\d{2}:\d{2})$/.test(trimmed) ? trimmed : `${trimmed}Z`
  const parsed = Date.parse(withZone)
  if (Number.isNaN(parsed)) return null
  return new Date(parsed).toISOString()
}

export const goldApiSchema = z.object({
  currency: z.literal('USD'),
  price: z.number(),
  symbol: z.literal('XAU'),
  updatedAt: z.string(),
})

export const corganoSchema = z.object({
  data: z.object({
    symbol: z.literal('XAU'),
    price_usd: z.object({
      per_oz: z.number(),
    }),
    as_of: z.string(),
  }),
})

export const nerkharaSchema = z.object({
  item: z.object({
    id: z.string(),
    unit: z.string(),
    price: z.number(),
    updated_utc: z.string(),
    stale: z.boolean(),
  }),
})
