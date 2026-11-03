import { quoteRequest, readBody } from './http.ts'
import type { Quote } from '../types.ts'
import { goldApiSchema, priceString, utcTimestamp } from '../validate.ts'

const url = 'https://api.gold-api.com/price/XAU/USD'

export async function fetchGoldApiQuote(fetchImpl: typeof fetch, now: Date): Promise<Quote> {
  const response = await fetchImpl(url, quoteRequest())
  const body = goldApiSchema.parse(await readBody(response))
  const price = priceString(body.price)
  const timestamp = utcTimestamp(body.updatedAt)
  if (price === null || timestamp === null) throw new Error('invalid_quote')
  return {
    instrument: 'XAU_USD',
    price,
    currency: 'USD',
    unit: 'troy_oz',
    source: 'gold-api.com',
    timestamp,
    fetchedAt: now.toISOString(),
    attribution: null,
  }
}
