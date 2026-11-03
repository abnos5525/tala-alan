export const instruments = ['XAU_USD', 'USD_IRT', 'GOLD_18K_GRAM'] as const

export type Instrument = (typeof instruments)[number]

export type QuoteCurrency = 'USD' | 'IRT'

export type QuoteUnit = 'troy_oz' | 'usd' | 'gram'

export type Quote = {
  instrument: Instrument
  price: string
  currency: QuoteCurrency
  unit: QuoteUnit
  source: string
  timestamp: string
  fetchedAt: string
  attribution: { text: string; url: string } | null
}

export type MarketState = 'READY' | 'DATA_UNAVAILABLE' | 'STALE_DATA' | 'SOURCE_CONFLICT'

export type Reading = {
  instrument: Instrument
  state: MarketState
  detail: string
  quote: Quote | null
}
