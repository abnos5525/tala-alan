import { quoteRequest, readBody } from './http.ts'
import type { Quote } from '../types.ts'
import { nerkharaSchema, priceString, utcTimestamp } from '../validate.ts'

const endpoints = {
  usd: {
    url: 'https://nerkhara.com/api/v1/latest/usd.json',
    id: 'usd',
    instrument: 'USD_IRT',
    unit: 'usd',
  },
  gold18k: {
    url: 'https://nerkhara.com/api/v1/latest/gold-18k.json',
    id: 'gold-18k',
    instrument: 'GOLD_18K_GRAM',
    unit: 'gram',
  },
} as const

export class StaleQuoteError extends Error {
  readonly quote: Quote

  constructor(quote: Quote) {
    super('stale')
    this.name = 'StaleQuoteError'
    this.quote = quote
  }
}

export async function fetchNerkharaQuote(
  which: keyof typeof endpoints,
  fetchImpl: typeof fetch,
  now: Date,
): Promise<Quote> {
  const endpoint = endpoints[which]
  const response = await fetchImpl(endpoint.url, quoteRequest())
  const body = nerkharaSchema.parse(await readBody(response))
  if (body.item.id !== endpoint.id || body.item.unit !== 'IRT') throw new Error('invalid_quote')
  const price = priceString(body.item.price)
  const timestamp = utcTimestamp(body.item.updated_utc)
  if (price === null || timestamp === null) throw new Error('invalid_quote')
  const quote: Quote = {
    instrument: endpoint.instrument,
    price,
    currency: 'IRT',
    unit: endpoint.unit,
    source: 'nerkhara.com',
    timestamp,
    fetchedAt: now.toISOString(),
    attribution: { text: 'NerkhAra', url: 'https://nerkhara.com' },
  }
  if (body.item.stale) throw new StaleQuoteError(quote)
  return quote
}
