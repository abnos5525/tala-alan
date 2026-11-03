import { expect, test } from 'vitest'
import type { Quote, Reading } from '../market/types.ts'
import { displayAmount, percentFromThreshold } from '../calc/display.ts'
import { buildCards } from './dashboardModel.ts'

test('percent is display rounding and does not treat zero threshold as a number', () => {
  expect(percentFromThreshold('110', '100')).toBe('10.00')
  expect(displayAmount('268936.792377')).toBe('268936.79')
  expect(percentFromThreshold('7.5', '0')).toBeNull()
})

test('gram gold prices both the dollar card and 18k gold', () => {
  const cards = buildCards([
    quote('XAU_USD', '31.1035', 'USD', 'troy_oz'),
    quote('USD_IRT', '10', 'IRT', 'usd'),
    quote('GOLD_18K_GRAM', '7.499', 'IRT', 'gram'),
  ])
  const dollar = cards.find((card) => card.title === 'دلار')
  const gold = cards.find((card) => card.title === 'طلای ۱۸ عیار')
  expect(dollar?.state).toBe('NOT_BUY')
  expect(dollar?.stateLabel).toBe('نه خرید')
  expect(dollar?.message).toBe('فعلاً زمان مناسبی برای خرید دلار نیست')
  expect(gold?.state).toBe('BUY')
  expect(gold?.stateLabel).toBe('خرید')
  expect(gold?.lines).toHaveLength(3)
  expect(gold?.lines[2]?.unit).toBe('تومان برای هر گرم')
})

function quote(instrument: Quote['instrument'], price: string, currency: Quote['currency'], unit: Quote['unit']): Reading {
  return {
    instrument,
    state: 'READY',
    detail: 'fresh',
    quote: {
      instrument,
      price,
      currency,
      unit,
      source: 'test',
      timestamp: '2026-11-03T20:00:00.000Z',
      fetchedAt: '2026-11-03T20:00:01.000Z',
      attribution: null,
    },
  }
}
