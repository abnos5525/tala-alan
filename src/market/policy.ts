import type { Instrument } from './types.ts'

/** Provisional gates. Not part of the supplied formulas. Confirm before release. */
export const marketPolicy = {
  maxAgeMs: {
    XAU_USD: 5 * 60 * 1000,
    USD_IRT: 30 * 60 * 1000,
    GOLD_18K_GRAM: 30 * 60 * 1000,
  } satisfies Record<Instrument, number>,
  /** Conflict when abs(a-b)/max(a,b) is greater than this. Equality at the limit stays ready. */
  maxRelativeSpread: '0.005',
  futureSkewMs: 60 * 1000,
}
