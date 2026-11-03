# Project progress

Current step: 4 — complete. Formula units are still unapproved. Conflict and age limits below are provisional.

Completed steps:
- STEP 0: repository and toolchain inspected; Cursor setup verified. No product code added.
- STEP 3: React, Vite, TypeScript, and Tailwind scaffolded with pnpm. No market adapters and no formulas.
- STEP 4: market adapters, Zod validation, freshness, and source-conflict handling. No formulas and no dashboard.

STEP 1 findings (no product code, formulas unchanged):

Formula units, checked against `docs/FORMULAS.md` and one read-only probe on 2026-11-03:
- 18K formula is dimensionally consistent only if `global_ounce_price` is USD per troy ounce, `USD_IRR_price` is the same local currency per 1 USD, `31.1035` stays grams per troy ounce, `0.75` stays 18/24, and `x` is that same currency per gram of 18K.
- USD formula cancels to local-currency-per-USD only if `gold_price` is that same currency per troy ounce of 18K. A per-gram or per-mithqal price does not cancel. Do not insert `31.1035` or any other factor unless the owner explicitly changes the supplied formula.
- One probe of a toman-per-gram 18K quote against a USD-per-troy-ounce quote made the written USD expression about 31 times smaller than the toman-per-USD quote. That matches the missing gram factor. It is evidence, not an approved formula change.
- `24/18` belongs on an 18K input. It is the reciprocal of `0.75`, not a substitute for it.
- Equality is already asymmetric in the supplied text: USD uses `>=` (equal means buy); 18K uses strictly below (equal means the sell branch). Leave it until the owner confirms.
- Rounding, maximum quote age, and the source-disagreement threshold are still unspecified. Do not invent them.

API comparison. A provider is usable only with documented commercial permission, browser CORS, and no secret in frontend code.
- Proposed, pending approval — global ounce: `https://api.gold-api.com/price/XAU/USD`. Terms dated 2026-09-10 permit commercial use. No key on `/price`. Probe: HTTP 200, `Access-Control-Allow-Origin: *`, JSON fields `price`, `currency=USD`, `symbol=XAU`, `updatedAt`. Docs state troy ounce, about 30 second updates. History/OHLC need a key and must not be called from the browser.
- Proposed second ounce source, pending approval: `https://goldprice.corgano.com/api/v1/latest`. CC BY 4.0, commercial use only with a visible “Gold price data by Corgano” link. No key. Probe: HTTP 200, CORS `*`, `price_usd.per_oz`, `as_of`. Limits about 10/minute, 60/hour, 500/day per IP.
- Proposed local USD and 18K, pending approval and the rights caveat below: `https://nerkhara.com/api/v1/latest/usd.json` and `gold-18k.json`. Their index says free to show, including commercially, if NerkhAra is named and linked and the read time is kept. Probe: HTTP 200, CORS `*`. `usd` is IRT (toman, 10 rials) for Tehran free market. `gold-18k` is IRT per gram. Both were `method=average`, two sources, with `updated_utc` and `stale`. Refresh about every 10 minutes. Their methodology says those two sources are TGJU and Bonbast. The same terms say NerkhAra grants no rights in the underlying sources' data.
- Rejected for this frontend-only app: Navasan (secret `api_key` in the query; free plan 120 requests/month and 2-hour updates). BrsApi gold/currency service (purchase stopped; public display of those prices forbidden by the provider). Dolarchand (secret `X-API-Key`). priceto.day (documents tgju.org as the source; no commercial grant found). fm5.ir (payload `source=tgju`; USD unit null; probed `updated_at` was 2026-10-31, stale versus the check time). NerkhAra `xau` (`method=lead`, one source; weaker license than gold-api/Corgano). USDT exchange prices are not the USD cash rate. No second lawful local feed was found, so local source conflict cannot yet be two independent providers.

Pending approvals:
- Confirm local currency is toman (IRT), not rial, for every local input and for both outputs.
- Confirm `global_ounce_price` is USD per troy ounce of fine gold.
- USD formula: confirm `gold_price` is 18K per troy ounce in that same currency, or explicitly approve a formula change. Per-gram input is not valid as written.
- Confirm the 18K comparison: market toman per gram versus `x` in toman per gram, with equality on the sell branch.
- Approve gold-api.com plus Corgano for the ounce, and NerkhAra for USD and 18K, including NerkhAra’s no-rights-in-upstream disclaimer. Or name other providers.
- Still open after that: rounding, maximum quote age, and what spread counts as a source conflict.

STEP 2 proposal (no files scaffolded, no dependencies installed):

One screen. No router, no global store, no charts, no localStorage for prices, no backend.

```
index.html                 official telegram-web-app.js before the app script
src/main.tsx               bootstrap
src/app/                   compose fetch, freshness, calc, and view
src/market/types.ts        normalized quote
src/market/validate.ts     Zod at the network boundary
src/market/freshness.ts    missing, stale, and conflict gates
src/market/adapters/       one provider per file; fetch stays here
src/calc/                  pure Decimal functions; no fetch and no DOM
src/ui/                    Persian RTL states and cards; no arithmetic
src/telegram/webapp.ts     theme, viewport, safe area, ready()
```

Flow: adapter → Zod → normalized quote → freshness gate → calc only when inputs are valid → UI. A failed gate shows `DATA_UNAVAILABLE`, `STALE_DATA`, or `SOURCE_CONFLICT` and does not call the signal formula.

Dependencies to add at STEP 3, versions resolved then by pnpm:
- Runtime: `react`, `react-dom`, `decimal.js`, `zod`
- Build: `vite`, `typescript`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`
- Test: `vitest`
- Telegram: the official `telegram-web-app.js` script. No `@tma.js/sdk` and no `@telegram-apps/sdk`.
- Not included: router, chart library, CSS component kit, ESLint beyond the Vite template default, Playwright.

`initData` is read only as untrusted context. It is not treated as identity.

Adapter slots stay replaceable until STEP 1 providers are approved. Formula text stays in `src/calc` exactly as supplied until the owner approves units or an explicit change.

STEP 3 result:
- Official `create-vite` 9.3.3 React TypeScript template, adapted in place so `docs/` and `.cursor/` stayed. Package name `gold`. TypeScript `strict` is on.
- Tailwind via `@tailwindcss/vite`. Runtime also has `decimal.js` and `zod`. Tests use `vitest`. Lint is the template `oxlint`.
- App entry is `src/app/App.tsx`. Empty slots: `src/market/adapters`, `src/calc`, `src/ui`, `src/telegram`.
- `src/stack.test.ts` only checks that Decimal and Zod load. It is not a formula test.
- Telegram script is not added. That is STEP 7.

Latest verified checks:
- STEP 0 toolchain checks remain as recorded below.
- 2026-11-03 probes: gold-api, Corgano, XAUS, NerkhAra `usd`/`gold-18k`/`xau`, and fm5 USD/GOLD18 returned HTTP 200 with CORS `*`. Navasan and BrsApi were rejected from their published terms, not from a live call.
- `node -v` → v26.13.0
- `npm -v` → 11.6.2
- `pnpm -v` → 12.16.1 after the broken Corepack shims in `C:\Program Files\nodejs` were renamed. The working binary is `C:\Users\Abnos\AppData\Roaming\npm\pnpm.cmd`.
- `git --version` → git version 2.42.0.windows.2
- `git status` at STEP 0 → fatal: not a git repository
- `pnpm test` → 1 file, 1 test passed (Vitest 5.1.0)
- `pnpm lint` → oxlint, exit 0
- `pnpm build` → `tsc -b && vite build` succeeded (Vite 8.3.5)
- Browser at `http://127.0.0.1:5173/`: title `gold`, counter went from 0 to 1 after a click

STEP 4 result:
- Adapters, no secrets: gold-api.com `XAU/USD` troy ounce, Corgano `per_oz` with required attribution, NerkhAra `usd` and `gold-18k` only when `unit` is `IRT` (toman). NerkhAra `xau` is not used.
- A failed or rate-limited source becomes `DATA_UNAVAILABLE`. Provider `stale: true` or age past the gate becomes `STALE_DATA`. Two ready quotes of one instrument become `SOURCE_CONFLICT` when `abs(a-b)/max(a,b) > 0.005`. The other instrument is left ready. One live source is kept when the other fails.
- Provisional gates in `src/market/policy.ts`: ounce max age 5 minutes, local quotes 30 minutes, spread limit `0.005`. These are not formula changes.
- UI still shows the Vite template. `loadMarket` is not wired to the screen.

Latest verified checks added:
- `pnpm test` → 2 files, 6 tests passed
- `pnpm exec tsc -b` → exit 0
- `pnpm lint` → exit 0

Cursor guidance placed on 2026-11-04, outside the product steps:
- Skill `.cursor/skills/persian-rtl` for Persian replies.
- Skill `.cursor/skills/source-repos` lists the Telegram, Decimal, Zod, Vite, React, and Tailwind repositories. They are not cloned.
- Rule `src-stack.mdc` for `src/**/*.{ts,tsx}`. Financial and Telegram rules now have file globs.
- `.gitignore` ignores `.cursor/` and `docs/`, so these files are on disk but not covered by git until that ignore changes.

Next action:
- STEP 5 is the Decimal formula engine. Do not start it until the owner confirms the USD formula mass unit and toman versus rial. The provisional spread and age gates can be corrected in the same answer.
