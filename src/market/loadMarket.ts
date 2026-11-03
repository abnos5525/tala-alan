import { ZodError } from 'zod'
import { fetchCorganoQuote } from './adapters/corgano.ts'
import { fetchGoldApiQuote } from './adapters/goldApi.ts'
import { MarketHttpError } from './adapters/http.ts'
import { fetchNerkharaQuote, StaleQuoteError } from './adapters/nerkhara.ts'
import { applyConflict, assessAge } from './freshness.ts'
import type { Instrument, Quote, Reading } from './types.ts'

type Job = {
  instrument: Instrument
  run: () => Promise<Quote>
}

export async function loadMarket(options?: { fetch?: typeof fetch; now?: Date }): Promise<Reading[]> {
  const fetchImpl = options?.fetch ?? fetch
  const now = options?.now ?? new Date()
  const jobs: Job[] = [
    { instrument: 'XAU_USD', run: () => fetchGoldApiQuote(fetchImpl, now) },
    { instrument: 'XAU_USD', run: () => fetchCorganoQuote(fetchImpl, now) },
    { instrument: 'USD_IRT', run: () => fetchNerkharaQuote('usd', fetchImpl, now) },
    { instrument: 'GOLD_18K_GRAM', run: () => fetchNerkharaQuote('gold18k', fetchImpl, now) },
  ]
  const readings = await Promise.all(jobs.map((job) => runJob(job, now)))
  return applyConflict(readings)
}

async function runJob(job: Job, now: Date): Promise<Reading> {
  try {
    return assessAge(await job.run(), now)
  } catch (error) {
    if (error instanceof StaleQuoteError) {
      return { instrument: job.instrument, state: 'STALE_DATA', detail: 'provider_stale', quote: error.quote }
    }
    return {
      instrument: job.instrument,
      state: 'DATA_UNAVAILABLE',
      detail: failureDetail(error),
      quote: null,
    }
  }
}

function failureDetail(error: unknown): string {
  if (error instanceof MarketHttpError) {
    return error.status === 429 ? 'rate_limited' : `http_${error.status}`
  }
  if (error instanceof ZodError) return 'invalid_payload'
  if (error instanceof Error && error.message === 'invalid_quote') return 'invalid_quote'
  if (error instanceof Error && error.message === 'invalid_json') return 'invalid_json'
  return 'network'
}
