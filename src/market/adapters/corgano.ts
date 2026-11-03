import { readBody } from './http.ts'
import type { Quote } from '../types.ts'
import { corganoSchema, priceString, utcTimestamp } from '../validate.ts'

const url = 'https://goldprice.corgano.com/api/v1/latest?currency=USD'

export async function fetchCorganoQuote(fetchImpl: typeof fetch, now: Date): Promise<Quote> {
  const response = await fetchImpl(url)
  const body = corganoSchema.parse(await readBody(response))
  const price = priceString(body.data.price_usd.per_oz)
  const timestamp = utcTimestamp(body.data.as_of)
  if (price === null || timestamp === null) throw new Error('invalid_quote')
  return {
    instrument: 'XAU_USD',
    price,
    currency: 'USD',
    unit: 'troy_oz',
    source: 'goldprice.corgano.com',
    timestamp,
    fetchedAt: now.toISOString(),
    attribution: {
      text: 'Gold price data by Corgano',
      url: 'https://goldprice.corgano.com/',
    },
  }
}
