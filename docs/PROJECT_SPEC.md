# Product specification

## Goal
A Persian RTL Telegram Mini App that calculates transparent, rule-based signals for USD/IRR and 18K gold. It is an information/calculation tool, not a financial adviser and never promises profit.

## Scope
- Frontend only: React + TypeScript + Vite + Tailwind; package manager: pnpm.
- No backend, database, private user portfolio, login system or payment system in v1.
- Telegram bot is only an entry point configured through BotFather (Main Mini App/Menu Button). A custom `/start` response or secure server-side Telegram identity verification is out of scope without a backend.
- First release: USD/IRR, 18K gold, and required global-ounce input only. Do not expand markets without approval.

## Data
- Use documented, lawful API providers that permit commercial browser-side use and CORS.
- Compare provider terms, freshness, units, rate limits, reliability and whether credentials are public or secret.
- Never expose secret API keys in browser code or `VITE_*` variables. If a server secret/proxy is required, stop and report; do not add a backend.
- Normalize each quote to `{ price, currency, unit, source, timestamp, fetchedAt }`.
- Show source, currency/unit and timestamp. Never label delayed/reference prices as executable live prices.
- No scraping, invented production data or silent fallback to stale prices.
- If data is missing, stale, invalid, rate-limited or materially conflicting, suppress the signal and explain why.

## Calculation and UX
- Read `docs/FORMULAS.md`; preserve the supplied formulas pending unit approval.
- Use Decimal arithmetic and pure functions for all money calculations.
- Dashboard cards show market price, calculated threshold, percentage difference, signal state, source and timestamp.
- Explain the arithmetic and inputs behind every signal.
- States: BUY, SELL, NOT_BUY, NEUTRAL, DATA_UNAVAILABLE, STALE_DATA, SOURCE_CONFLICT.
- Include loading, empty, error and offline states. Color is never the only indicator.
- No personal financial data collection in v1. No recommendations, trading execution, portfolio custody or profit guarantees.
- Do not add charts unless the selected provider supplies licensed historical data.

## Engineering
- TypeScript strict; feature-oriented folders; minimal dependencies; accessible, responsive mobile-first UI.
- Validate API payloads at runtime (e.g. Zod); isolate provider adapters; use Decimal for money.
- Add tests for formulas, units, thresholds, invalid/stale data, source conflicts and API failures.
- Keep UI, API adapters, validation and calculation engine separate.

## Security and limitations
- Treat all external data as untrusted.
- Do not use local storage for sensitive financial data.
- Do not treat Telegram `initData` as authenticated unless validated server-side.
- No paid subscriptions in v1: secure entitlements cannot be enforced in a frontend-only app.
- Show a clear notice that signals are formula outputs, not personalized investment advice; market quotes may differ from execution prices.
