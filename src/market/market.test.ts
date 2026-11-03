import { expect, test } from 'vitest'
import { loadMarket } from './loadMarket.ts'
import type { Instrument } from './types.ts'

const now = new Date('2026-11-03T21:00:00.000Z')

test('normalizes ounce, dollar, and 18k quotes', async () => {
  const readings = await loadMarket({ fetch: fakeFetch(okBodies()), now })
  const ready = readings.filter((reading) => reading.state === 'READY')
  expect(ready.map((reading) => reading.instrument).sort()).toEqual([
    'GOLD_18K_GRAM',
    'USD_IRT',
    'XAU_USD',
    'XAU_USD',
  ])
  const ounce = ready.find((reading) => reading.quote?.source === 'gold-api.com')
  expect(ounce?.quote).toMatchObject({
    currency: 'USD',
    unit: 'troy_oz',
    price: '3921',
    timestamp: '2026-11-03T20:58:00.000Z',
  })
  const localGold = ready.find((reading) => reading.instrument === 'GOLD_18K_GRAM')
  expect(localGold?.quote).toMatchObject({ currency: 'IRT', unit: 'gram', price: '1000' })
  const dollar = ready.find((reading) => reading.instrument === 'USD_IRT')
  expect(dollar?.quote).toMatchObject({ currency: 'IRT', unit: 'usd', attribution: { text: 'NerkhAra' } })
})

test('marks a rate limit and a network failure as unavailable', async () => {
  const readings = await loadMarket({
    fetch: fakeFetch(okBodies(), {
      'https://api.gold-api.com/price/XAU/USD': () => Promise.resolve(new Response('', { status: 429 })),
      'https://goldprice.corgano.com/api/v1/latest?currency=USD': () => Promise.reject(new TypeError('offline')),
    }),
    now,
  })
  const ounce = readings.filter((reading) => reading.instrument === 'XAU_USD')
  expect(ounce.map((reading) => reading.detail).sort()).toEqual(['network', 'rate_limited'])
  expect(ounce.every((reading) => reading.state === 'DATA_UNAVAILABLE' && reading.quote === null)).toBe(true)
})

test('rejects a bad payload, a non-positive price, and a future timestamp', async () => {
  const broken = await loadMarket({
    fetch: fakeFetch(okBodies(), {
      'https://api.gold-api.com/price/XAU/USD': () => Promise.resolve(new Response('{}', { status: 200 })),
    }),
    now,
  })
  expect(broken.find((reading) => reading.quote === null && reading.detail === 'invalid_payload')).toBeTruthy()

  const bodies = okBodies()
  bodies['https://api.gold-api.com/price/XAU/USD'] = { currency: 'USD', price: 0, symbol: 'XAU', updatedAt: '2026-11-03T20:58:00Z' }
  bodies['https://goldprice.corgano.com/api/v1/latest?currency=USD'] = { data: { symbol: 'XAU', price_usd: { per_oz: 10 }, as_of: '2026-11-03T21:05:00Z' } }
  bodies['https://nerkhara.com/api/v1/latest/usd.json'] = { item: { id: 'usd', unit: 'IRR', price: 10, updated_utc: '2026-11-03T20:50:00', stale: false } }
  const readings = await loadMarket({ fetch: fakeFetch(bodies), now })
  expect(detail(readings, 'XAU_USD')).toEqual(['invalid_quote', 'timestamp_future'])
  expect(detail(readings, 'USD_IRT')).toEqual(['invalid_quote'])
})

test('marks provider stale and over-age quotes as stale', async () => {
  const bodies = okBodies()
  const staleGold = bodies['https://nerkhara.com/api/v1/latest/gold-18k.json'] as {
    item: { stale: boolean; updated_utc: string }
  }
  staleGold.item.stale = true
  const oldOunce = bodies['https://api.gold-api.com/price/XAU/USD'] as { updatedAt: string }
  oldOunce.updatedAt = '2026-11-03T20:50:00Z'
  const readings = await loadMarket({ fetch: fakeFetch(bodies), now })
  expect(readings.find((reading) => reading.instrument === 'GOLD_18K_GRAM')?.state).toBe('STALE_DATA')
  expect(readings.find((reading) => reading.quote?.source === 'gold-api.com')?.state).toBe('STALE_DATA')
  expect(readings.find((reading) => reading.quote?.source === 'goldprice.corgano.com')?.state).toBe('READY')
})

test('keeps equal ounce prices and blocks a spread above the limit', async () => {
  const calm = await loadMarket({ fetch: fakeFetch(okBodies()), now })
  expect(calm.filter((reading) => reading.instrument === 'XAU_USD').every((reading) => reading.state === 'READY')).toBe(true)

  const bodies = okBodies()
  const corgano = bodies['https://goldprice.corgano.com/api/v1/latest?currency=USD'] as {
    data: { price_usd: { per_oz: number } }
  }
  corgano.data.price_usd.per_oz = 3945
  const conflicted = await loadMarket({ fetch: fakeFetch(bodies), now })
  const ounce = conflicted.filter((reading) => reading.instrument === 'XAU_USD')
  expect(ounce.every((reading) => reading.state === 'SOURCE_CONFLICT')).toBe(true)
  expect(ounce.every((reading) => reading.quote !== null)).toBe(true)
  expect(conflicted.find((reading) => reading.instrument === 'USD_IRT')?.state).toBe('READY')
})

function detail(readings: { instrument: Instrument; detail: string }[], instrument: Instrument): string[] {
  return readings.filter((reading) => reading.instrument === instrument).map((reading) => reading.detail).sort()
}

function okBodies(): Record<string, unknown> {
  return {
    'https://api.gold-api.com/price/XAU/USD': {
      currency: 'USD',
      price: 3921,
      symbol: 'XAU',
      updatedAt: '2026-11-03T20:58:00Z',
    },
    'https://goldprice.corgano.com/api/v1/latest?currency=USD': {
      data: { symbol: 'XAU', price_usd: { per_oz: 3921 }, as_of: '2026-11-03T20:58:30Z' },
    },
    'https://nerkhara.com/api/v1/latest/usd.json': {
      item: { id: 'usd', unit: 'IRT', price: 270000, updated_utc: '2026-11-03T20:50:00', stale: false },
    },
    'https://nerkhara.com/api/v1/latest/gold-18k.json': {
      item: { id: 'gold-18k', unit: 'IRT', price: 1000, updated_utc: '2026-11-03T20:50:00', stale: false },
    },
  }
}

function fakeFetch(bodies: Record<string, unknown>, overrides: Record<string, () => Promise<Response>> = {}): typeof fetch {
  return (input) => {
    const url = String(input)
    const override = overrides[url]
    if (override) return override()
    const body = bodies[url]
    if (body === undefined) return Promise.resolve(new Response('no', { status: 404 }))
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
  }
}
