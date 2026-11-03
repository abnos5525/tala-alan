import Decimal from 'decimal.js'
import { marketPolicy } from '../market/policy.ts'
import type { Quote, Reading } from '../market/types.ts'
import { gold18kExpression, goldIsBuy, usdExpression, usdIsBuy } from './formulas.ts'

export type SignalState = 'BUY' | 'SELL' | 'NOT_BUY' | 'DATA_UNAVAILABLE' | 'STALE_DATA' | 'SOURCE_CONFLICT'

export type Signal = {
  state: SignalState
  label: string | null
  threshold: string | null
  detail: string
}

const caveat = 'formula_not_execution_price'

export function evaluateUsd(readings: Reading[]): Signal {
  const gold = oneReady(readings, 'GOLD_18K_GRAM')
  if (!gold.ok) return blocked(gold.state, gold.detail)
  const ounce = oneReady(readings, 'XAU_USD')
  if (!ounce.ok) return blocked(ounce.state, ounce.detail)
  const market = oneReady(readings, 'USD_IRT')
  if (!market.ok) return blocked(market.state, market.detail)

  if (gold.quote.unit !== 'gram' || gold.quote.currency !== 'IRT' || gold.quote.currency !== market.quote.currency || market.quote.unit !== 'usd') {
    return blocked('DATA_UNAVAILABLE', 'unit_mismatch')
  }
  if (ounce.quote.currency !== 'USD' || ounce.quote.unit !== 'troy_oz') {
    return blocked('DATA_UNAVAILABLE', 'unit_mismatch')
  }

  const threshold = usdExpression(gold.quote.price, ounce.quote.price)
  const buy = usdIsBuy(gold.quote.price, ounce.quote.price, market.quote.price)
  if (threshold === null || buy === null) return blocked('DATA_UNAVAILABLE', 'invalid_price')
  return {
    state: buy ? 'BUY' : 'NOT_BUY',
    label: buy ? 'الان زمان خرید دلار است' : 'فعلاً زمان مناسبی برای خرید دلار نیست',
    threshold,
    detail: caveat,
  }
}

export function evaluateGold18k(readings: Reading[]): Signal {
  const ounce = oneReady(readings, 'XAU_USD')
  if (!ounce.ok) return blocked(ounce.state, ounce.detail)
  const usd = oneReady(readings, 'USD_IRT')
  if (!usd.ok) return blocked(usd.state, usd.detail)
  const gold = oneReady(readings, 'GOLD_18K_GRAM')
  if (!gold.ok) return blocked(gold.state, gold.detail)

  if (ounce.quote.currency !== 'USD' || ounce.quote.unit !== 'troy_oz' || usd.quote.unit !== 'usd' || usd.quote.currency !== 'IRT' || gold.quote.unit !== 'gram' || gold.quote.currency !== usd.quote.currency) {
    return blocked('DATA_UNAVAILABLE', 'unit_mismatch')
  }

  const threshold = gold18kExpression(ounce.quote.price, usd.quote.price)
  const buy = goldIsBuy(gold.quote.price, ounce.quote.price, usd.quote.price)
  if (threshold === null || buy === null) return blocked('DATA_UNAVAILABLE', 'invalid_price')
  return {
    state: buy ? 'BUY' : 'SELL',
    label: buy ? 'زمان مناسب خرید طلا' : 'سیگنال فروش طلا',
    threshold,
    detail: caveat,
  }
}

function blocked(state: 'DATA_UNAVAILABLE' | 'STALE_DATA' | 'SOURCE_CONFLICT', detail: string): Signal {
  return { state, label: null, threshold: null, detail }
}

function oneReady(readings: Reading[], instrument: Reading['instrument']): { ok: true; quote: NonNullable<Reading['quote']> } | { ok: false; state: 'DATA_UNAVAILABLE' | 'STALE_DATA' | 'SOURCE_CONFLICT'; detail: string } {
  const group = readings.filter((reading) => reading.instrument === instrument)
  if (group.some((reading) => reading.state === 'SOURCE_CONFLICT')) {
    return { ok: false, state: 'SOURCE_CONFLICT', detail: 'source_conflict' }
  }
  const ready = group.filter((reading) => reading.state === 'READY' && reading.quote !== null)
  if (ready.length > 1) {
    if (widestSpread(ready).gt(new Decimal(marketPolicy.maxRelativeSpread))) {
      return { ok: false, state: 'SOURCE_CONFLICT', detail: 'source_conflict' }
    }
    return { ok: true, quote: preferredQuote(ready) }
  }
  if (ready.length === 1) return { ok: true, quote: ready[0].quote as NonNullable<Reading['quote']> }
  if (group.some((reading) => reading.state === 'STALE_DATA')) {
    return { ok: false, state: 'STALE_DATA', detail: 'stale' }
  }
  return { ok: false, state: 'DATA_UNAVAILABLE', detail: 'missing' }
}

const ouncePreference = ['gold-api.com', 'goldprice.corgano.com']

function preferredQuote(ready: Reading[]): Quote {
  for (const source of ouncePreference) {
    const match = ready.find((reading) => reading.quote?.source === source)
    if (match?.quote) return match.quote
  }
  const quote = ready[0]?.quote
  if (!quote) throw new Error('ready quote missing')
  return quote
}

function widestSpread(ready: Reading[]): Decimal {
  let widest = new Decimal(0)
  for (let left = 0; left < ready.length; left += 1) {
    for (let right = left + 1; right < ready.length; right += 1) {
      const a = new Decimal(ready[left].quote!.price)
      const b = new Decimal(ready[right].quote!.price)
      const spread = a.minus(b).abs().div(Decimal.max(a, b))
      if (spread.gt(widest)) widest = spread
    }
  }
  return widest
}
