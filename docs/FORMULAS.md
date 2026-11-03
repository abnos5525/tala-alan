# Formula contract — approval required before implementation

Do not silently modify either formula. First identify the exact unit of every input and verify dimensional consistency. If ambiguous, stop and ask the owner.

## USD signal — shop units confirmed 2026-11-04

Owner decision: use the units quoted in Iranian gold shops and exchange shops.

- `gold_price`: 18K gold, toman per gram. Shops sell and board this price per gram, not per mithqal and not per troy ounce.
- `global_ounce_price`: XAUUSD, USD per troy ounce.
- `market_USD_IRR_price`: toman per 1 USD. The same toman unit as the gold quote. Not rial.
- `x`: toman per 1 USD.

The supplied ratio is the purity conversion only. With gram gold it is not a toman-per-USD rate. The gram-to-troy-ounce factor already present in the 18K formula, `31.1035`, is required here too. Wage, profit, and tax are not part of either signal.

`x = (gold_price × (24 / 18) × 31.1035) / global_ounce_price`

Comparison is unchanged:
- If `x >= market_USD_IRR_price`: “الان زمان خرید دلار است”.
- Otherwise: “فعلاً زمان مناسبی برای خرید دلار نیست”.

This is the inverse of the 18K formula. Equality buys.

## 18K gold signal — supplied formula

`x = (global_ounce_price × USD_IRR_price × 0.75) / 31.1035`

User's intended comparison:
- If market 18K gold price per gram is below `x`: green label, “زمان مناسب خرید طلا”.
- Otherwise: red label, “سیگنال فروش طلا”.

Confirmed units, same owner decision:
- `global_ounce_price`: USD per troy ounce.
- `USD_IRR_price`: toman per 1 USD.
- `x`: toman per gram of 18K gold.
- `31.1035`: grams per troy ounce.
- `0.75`: 18/24 purity factor.

When two ounce quotes are both ready and their relative spread is within the market limit, the formula uses `gold-api.com` if that quote is ready, otherwise the other ready quote. It does not average. A wider spread stays `SOURCE_CONFLICT`.

## Required edge cases
- Equality threshold.
- Zero/negative/missing inputs.
- Precision and rounding policy.
- Quote age and provider disagreement.
- Display precision versus calculation precision.
- Spread, fees and execution-price caveat.

Owner confirmed the shop units on 2026-11-04. Do not change either expression again without a new approval.
