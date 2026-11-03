# Formula contract — approval required before implementation

Do not silently modify either formula. First identify the exact unit of every input and verify dimensional consistency. If ambiguous, stop and ask the owner.

## USD signal — supplied formula

`x = (gold_price × (24 / 18)) / global_ounce_price`

User's intended comparison:
- If `x >= market_USD_IRR_price`: green label, “الان زمان خرید دلار است”.
- Otherwise: “فعلاً زمان مناسبی برای خرید دلار نیست”.

Open questions:
- Is `gold_price` 18K or 24K?
- Is it priced per gram, per mithqal, or another unit?
- Is it in IRR, toman, or USD?
- Is `global_ounce_price` XAUUSD in USD per troy ounce?
- What is the intended unit of `x`? The current expression may not be dimensionally valid as written.

A possible gram/troy-ounce conversion factor must not be inserted without explicit approval.

## 18K gold signal — supplied formula

`x = (global_ounce_price × USD_IRR_price × 0.75) / 31.1035`

User's intended comparison:
- If market 18K gold price per gram is below `x`: green label, “زمان مناسب خرید طلا”.
- Otherwise: red label, “سیگنال فروش طلا”.

Expected units, subject to confirmation:
- `global_ounce_price`: USD per troy ounce.
- `USD_IRR_price`: toman per USD (or rial per USD, but be consistent).
- `x`: toman (or rial) per gram of 18K gold.
- `31.1035`: grams per troy ounce.
- `0.75`: 18K purity factor.

## Required edge cases
- Equality threshold.
- Zero/negative/missing inputs.
- Precision and rounding policy.
- Quote age and provider disagreement.
- Display precision versus calculation precision.
- Spread, fees and execution-price caveat.

No formula implementation until the owner confirms the open questions.
