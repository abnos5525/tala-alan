import { displayAmount, percentFromThreshold } from '../calc/display.ts'
import { evaluateGold18k, evaluateUsd } from '../calc/signals.ts'
import type { Signal, SignalState } from '../calc/signals.ts'
import type { Quote, Reading } from '../market/types.ts'

export type PriceLine = {
  label: string
  price: string
  unit: string
  source: string
  time: string
  attribution: { text: string; url: string } | null
}

export type CardModel = {
  title: string
  state: SignalState
  stateLabel: string
  message: string
  formula: string
  threshold: string | null
  percent: string | null
  lines: PriceLine[]
}

const stateLabels: Record<SignalState, string> = {
  BUY: 'خرید',
  SELL: 'فروش',
  NOT_BUY: 'نه خرید',
  DATA_UNAVAILABLE: 'داده نیست',
  STALE_DATA: 'داده کهنه',
  SOURCE_CONFLICT: 'اختلاف منبع',
}

export function buildCards(readings: Reading[]): CardModel[] {
  return [usdCard(readings), goldCard(readings)]
}

function usdCard(readings: Reading[]): CardModel {
  const signal = evaluateUsd(readings)
  const market = singleQuote(readings, 'USD_IRT')
  return {
    title: 'دلار',
    state: signal.state,
    stateLabel: stateLabels[signal.state],
    message: signal.label ?? explain(signal),
    formula: 'آستانه = (قیمت هر گرم طلای ۱۸ عیار × ۲۴ / ۱۸ × ۳۱٫۱۰۳۵)\n÷ انس جهانی',
    threshold: signal.threshold === null ? null : displayAmount(signal.threshold),
    percent: signal.threshold && market ? percentFromThreshold(market.price, signal.threshold) : null,
    lines: lines(readings, ['GOLD_18K_GRAM', 'XAU_USD', 'USD_IRT']),
  }
}

function goldCard(readings: Reading[]): CardModel {
  const signal = evaluateGold18k(readings)
  const market = singleQuote(readings, 'GOLD_18K_GRAM')
  return {
    title: 'طلای ۱۸ عیار',
    state: signal.state,
    stateLabel: stateLabels[signal.state],
    message: signal.label ?? explain(signal),
    formula: 'آستانه = (انس × نرخ دلار × ۰٫۷۵) / ۳۱٫۱۰۳۵',
    threshold: signal.threshold === null ? null : displayAmount(signal.threshold),
    percent: signal.threshold && market ? percentFromThreshold(market.price, signal.threshold) : null,
    lines: lines(readings, ['XAU_USD', 'USD_IRT', 'GOLD_18K_GRAM']),
  }
}

function explain(signal: Signal): string {
  if (signal.detail === 'unit_mismatch') return 'واحد این قیمت با فرمول تأییدشده جور نیست، پس سیگنال ساخته نشد.'
  if (signal.detail === 'multiple_ready') return 'بیش از یک قیمت آماده برای یک ورودی هست و میانگینی ساخته نمی‌شود.'
  if (signal.state === 'STALE_DATA') return 'قیمت کهنه است و سیگنال ساخته نشد.'
  if (signal.state === 'SOURCE_CONFLICT') return 'منبع‌ها با هم نمی‌خوانند و سیگنال ساخته نشد.'
  if (signal.detail === 'network') return 'ارتباط برقرار نشد.'
  return 'قیمت قابل محاسبه نیست.'
}

function singleQuote(readings: Reading[], instrument: Reading['instrument']): Quote | null {
  const ready = readings.filter((reading) => reading.instrument === instrument && reading.state === 'READY' && reading.quote)
  if (ready.length !== 1 || ready[0].quote === null) return null
  return ready[0].quote
}

function lines(readings: Reading[], instruments: Reading['instrument'][]): PriceLine[] {
  return readings
    .filter((reading) => instruments.includes(reading.instrument) && reading.quote !== null)
    .map((reading) => {
      const quote = reading.quote as Quote
      return {
        label: lineLabel(quote),
        price: quote.price,
        unit: unitLabel(quote),
        source: quote.source,
        time: quote.timestamp,
        attribution: quote.attribution,
      }
    })
}

function lineLabel(quote: Quote): string {
  if (quote.instrument === 'XAU_USD') return 'انس جهانی'
  if (quote.instrument === 'USD_IRT') return 'دلار بازار'
  return 'طلای ۱۸ عیار'
}

function unitLabel(quote: Quote): string {
  if (quote.currency === 'USD' && quote.unit === 'troy_oz') return 'دلار برای هر اونس تروی'
  if (quote.currency === 'IRT' && quote.unit === 'usd') return 'تومان برای هر دلار'
  if (quote.currency === 'IRT' && quote.unit === 'gram') return 'تومان برای هر گرم'
  return `${quote.currency} / ${quote.unit}`
}
