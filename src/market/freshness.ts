import Decimal from 'decimal.js'
import { marketPolicy } from './policy.ts'
import type { Quote, Reading } from './types.ts'

export function assessAge(quote: Quote, now: Date): Reading {
  const timestampMs = Date.parse(quote.timestamp)
  if (Number.isNaN(timestampMs)) {
    return blocked(quote, 'DATA_UNAVAILABLE', 'timestamp')
  }
  const ageMs = now.getTime() - timestampMs
  if (ageMs < -marketPolicy.futureSkewMs) {
    return blocked(quote, 'DATA_UNAVAILABLE', 'timestamp_future')
  }
  if (ageMs > marketPolicy.maxAgeMs[quote.instrument]) {
    return blocked(quote, 'STALE_DATA', 'max_age')
  }
  return { instrument: quote.instrument, state: 'READY', detail: 'fresh', quote }
}

export function applyConflict(readings: Reading[]): Reading[] {
  const limit = new Decimal(marketPolicy.maxRelativeSpread)
  const readyByInstrument = new Map<string, Reading[]>()
  for (const reading of readings) {
    if (reading.state !== 'READY' || reading.quote === null) continue
    const group = readyByInstrument.get(reading.instrument) ?? []
    group.push(reading)
    readyByInstrument.set(reading.instrument, group)
  }

  const conflicted = new Set<Reading>()
  const details = new Map<Reading, string>()
  for (const group of readyByInstrument.values()) {
    if (group.length < 2) continue
    let widest = new Decimal(0)
    for (let left = 0; left < group.length; left += 1) {
      for (let right = left + 1; right < group.length; right += 1) {
        const a = new Decimal(group[left].quote!.price)
        const b = new Decimal(group[right].quote!.price)
        const spread = a.minus(b).abs().div(Decimal.max(a, b))
        if (spread.gt(widest)) widest = spread
      }
    }
    if (widest.gt(limit)) {
      const detail = `spread=${widest.toFixed(6)}`
      for (const reading of group) {
        conflicted.add(reading)
        details.set(reading, detail)
      }
    }
  }

  return readings.map((reading) => {
    if (!conflicted.has(reading) || reading.quote === null) return reading
    return blocked(reading.quote, 'SOURCE_CONFLICT', details.get(reading) ?? 'spread')
  })
}

function blocked(quote: Quote, state: 'DATA_UNAVAILABLE' | 'STALE_DATA' | 'SOURCE_CONFLICT', detail: string): Reading {
  return { instrument: quote.instrument, state, detail, quote }
}
