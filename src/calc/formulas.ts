import Decimal from 'decimal.js'

const D = Decimal.clone({ precision: 80 })
const positive = /^(?:0|[1-9]\d*)(?:\.\d+)?$/
const gramsPerTroyOz = '31.1035'

/** x = (gold toman per gram × (24 / 18) × grams per troy oz) / USD per troy oz. */
export function usdExpression(goldPrice: string, ouncePrice: string): string | null {
  const gold = decimal(goldPrice)
  const ounce = decimal(ouncePrice)
  if (gold === null || ounce === null) return null
  return gold.times(24).times(gramsPerTroyOz).div(18).div(ounce).toFixed()
}

/** Same comparison as x >= market, multiplied through so 24/18 is not rounded first. */
export function usdIsBuy(goldPrice: string, ouncePrice: string, marketPrice: string): boolean | null {
  const gold = decimal(goldPrice)
  const ounce = decimal(ouncePrice)
  const market = decimal(marketPrice)
  if (gold === null || ounce === null || market === null) return null
  return gold.times(24).times(gramsPerTroyOz).gte(market.times(ounce).times(18))
}

/** x = (global_ounce_price × USD_IRR_price × 0.75) / 31.1035 */
export function gold18kExpression(ouncePrice: string, usdPrice: string): string | null {
  const ounce = decimal(ouncePrice)
  const usd = decimal(usdPrice)
  if (ounce === null || usd === null) return null
  return ounce.times(usd).times('0.75').div(gramsPerTroyOz).toFixed()
}

/** Same comparison as market < x, multiplied through by 31.1035. */
export function goldIsBuy(marketPrice: string, ouncePrice: string, usdPrice: string): boolean | null {
  const market = decimal(marketPrice)
  const ounce = decimal(ouncePrice)
  const usd = decimal(usdPrice)
  if (market === null || ounce === null || usd === null) return null
  return market.times(gramsPerTroyOz).lt(ounce.times(usd).times('0.75'))
}

function decimal(value: string): Decimal | null {
  if (!positive.test(value)) return null
  const parsed = new D(value)
  if (!parsed.isFinite() || parsed.lte(0)) return null
  return parsed
}
