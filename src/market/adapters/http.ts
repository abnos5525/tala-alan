export function quoteRequest(): RequestInit {
  return {
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  }
}

export class MarketHttpError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`HTTP ${status}`)
    this.name = 'MarketHttpError'
    this.status = status
  }
}

export async function readBody(response: Response): Promise<unknown> {
  if (response.status === 429) throw new MarketHttpError(429)
  if (!response.ok) throw new MarketHttpError(response.status)
  const text = await response.text()
  try {
    return JSON.parse(text) as unknown
  } catch (error) {
    throw new Error('invalid_json', { cause: error })
  }
}
