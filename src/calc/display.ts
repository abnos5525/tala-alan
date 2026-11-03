import Decimal from 'decimal.js'

const D = Decimal.clone({ precision: 80 })
const positive = /^(?:0|[1-9]\d*)(?:\.\d+)?$/

/** Display-only amount. The signal comparison keeps the full Decimal. */
export function displayAmount(value: string): string {
  return new D(value).toFixed(2)
}

/** Display-only percent. Does not change the signal comparison. */
export function percentFromThreshold(market: string, threshold: string): string | null {
  if (!positive.test(market) || !positive.test(threshold)) return null
  const base = new D(threshold)
  if (!base.isFinite() || base.lte(0)) return null
  return new D(market).minus(base).div(base).times(100).toFixed(2)
}
