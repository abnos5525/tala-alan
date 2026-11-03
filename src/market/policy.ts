import type { Instrument } from './types.ts'

/** Confirmed 2026-11-04. Ounce quotes move in seconds, so 5 minutes is the stale gate. Local quotes refresh about every 10 minutes, so 15 minutes allows one missed refresh. */
export const marketPolicy = {
  maxAgeMs: {
    XAU_USD: 5 * 60 * 1000,
    USD_IRT: 15 * 60 * 1000,
    GOLD_18K_GRAM: 15 * 60 * 1000,
  } satisfies Record<Instrument, number>,
  /** Conflict when abs(a-b)/max(a,b) is greater than this. Equality at the limit stays ready. */
  maxRelativeSpread: '0.005',
  futureSkewMs: 60 * 1000,
}
