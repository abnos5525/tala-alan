import { expect, test } from 'vitest'
import type { Quote, Reading } from '../market/types.ts'
import { gold18kExpression, usdExpression } from './formulas.ts'
import { evaluateGold18k, evaluateUsd } from './signals.ts'

test('usd expression converts gram gold into toman per dollar', () => {
  expect(usdExpression('7.5', '31.1035')).toBe('10')
  expect(usdExpression('0', '1')).toBeNull()
  expect(usdExpression('18', '-1')).toBeNull()
})

test('18k expression keeps 0.75 and 31.1035 without float residue', () => {
  expect(gold18kExpression('31.1035', '10')).toBe('7.5')
  expect(gold18kExpression('31.1035', '0')).toBeNull()
})

test('usd equality buys and a smaller ratio does not', () => {
  const at = evaluateUsd([
    quote('GOLD_18K_GRAM', '7.5', 'IRT', 'gram'),
    quote('XAU_USD', '31.1035', 'USD', 'troy_oz'),
    quote('USD_IRT', '10', 'IRT', 'usd'),
  ])
  expect(at.state).toBe('BUY')
  expect(at.label).toBe('الان زمان خرید دلار است')
  expect(at.threshold).toBe('10')

  const below = evaluateUsd([
    quote('GOLD_18K_GRAM', '7.5', 'IRT', 'gram'),
    quote('XAU_USD', '31.1035', 'USD', 'troy_oz'),
    quote('USD_IRT', '10.0000001', 'IRT', 'usd'),
  ])
  expect(below.state).toBe('NOT_BUY')
})

test('ounce-denominated gold does not emit a usd signal', () => {
  const signal = evaluateUsd([
    quote('GOLD_18K_GRAM', '1000', 'IRT', 'troy_oz'),
    quote('XAU_USD', '10', 'USD', 'troy_oz'),
    quote('USD_IRT', '1', 'IRT', 'usd'),
  ])
  expect(signal).toMatchObject({ state: 'DATA_UNAVAILABLE', detail: 'unit_mismatch', label: null, threshold: null })
})

test('18k equality sells and a lower market price buys', () => {
  const equal = evaluateGold18k([
    quote('XAU_USD', '31.1035', 'USD', 'troy_oz'),
    quote('USD_IRT', '10', 'IRT', 'usd'),
    quote('GOLD_18K_GRAM', '7.5', 'IRT', 'gram'),
  ])
  expect(equal.state).toBe('SELL')
  expect(equal.threshold).toBe('7.5')

  const buy = evaluateGold18k([
    quote('XAU_USD', '31.1035', 'USD', 'troy_oz'),
    quote('USD_IRT', '10', 'IRT', 'usd'),
    quote('GOLD_18K_GRAM', '7.499', 'IRT', 'gram'),
  ])
  expect(buy.state).toBe('BUY')
  expect(buy.label).toBe('زمان مناسب خرید طلا')
})

test('stale and conflicting quotes suppress the signal', () => {
  expect(evaluateGold18k([
    reading('XAU_USD', 'STALE_DATA'),
    quote('USD_IRT', '10', 'IRT', 'usd'),
    quote('GOLD_18K_GRAM', '1', 'IRT', 'gram'),
  ]).state).toBe('STALE_DATA')

  expect(evaluateGold18k([
    reading('USD_IRT', 'SOURCE_CONFLICT'),
    quote('XAU_USD', '31.1035', 'USD', 'troy_oz'),
    quote('GOLD_18K_GRAM', '1', 'IRT', 'gram'),
  ]).state).toBe('SOURCE_CONFLICT')

  expect(evaluateGold18k([
    quote('XAU_USD', '31.1035', 'USD', 'troy_oz', 'a'),
    quote('XAU_USD', '40', 'USD', 'troy_oz', 'b'),
    quote('USD_IRT', '10', 'IRT', 'usd'),
    quote('GOLD_18K_GRAM', '1', 'IRT', 'gram'),
  ]).detail).toBe('source_conflict')
})

test('agreeing ounce quotes use gold-api and do not average', () => {
  const signal = evaluateGold18k([
    quote('XAU_USD', '31.1035', 'USD', 'troy_oz', 'goldprice.corgano.com'),
    quote('XAU_USD', '31.2', 'USD', 'troy_oz', 'gold-api.com'),
    quote('USD_IRT', '10', 'IRT', 'usd'),
    quote('GOLD_18K_GRAM', '1', 'IRT', 'gram'),
  ])
  expect(signal.detail).not.toBe('multiple_ready')
  expect(gold18kExpression('31.2', '10')).toBe(signal.threshold)
})

test('currency mismatch and a missing quote do not calculate', () => {
  expect(evaluateGold18k([
    quote('XAU_USD', '31.1035', 'USD', 'troy_oz'),
    quote('USD_IRT', '10', 'IRT', 'usd'),
    quote('GOLD_18K_GRAM', '1', 'USD', 'gram'),
  ]).detail).toBe('unit_mismatch')

  expect(evaluateUsd([quote('USD_IRT', '1', 'IRT', 'usd')]).detail).toBe('missing')
})

function quote(instrument: Quote['instrument'], price: string, currency: Quote['currency'], unit: Quote['unit'], source = 'test'): Reading {
  return {
    instrument,
    state: 'READY',
    detail: 'fresh',
    quote: {
      instrument,
      price,
      currency,
      unit,
      source,
      timestamp: '2026-11-03T20:00:00.000Z',
      fetchedAt: '2026-11-03T20:00:01.000Z',
      attribution: null,
    },
  }
}

function reading(instrument: Quote['instrument'], state: 'STALE_DATA' | 'SOURCE_CONFLICT'): Reading {
  return { instrument, state, detail: state, quote: null }
}
