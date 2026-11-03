# Project progress

Current step: 0 — complete

Completed steps:
- STEP 0: repository and toolchain inspected; Cursor setup verified. No product code added.

Verified facts:
- Repo is docs + Cursor setup only. Present: `docs/PROJECT_SPEC.md`, `docs/WORKFLOW.md`, `docs/FORMULAS.md`, `docs/PROGRESS.md`, `CURSOR_START_HERE_FA.md`, `.cursorignore`, `.cursor/rules` (00-core always-on; financial-engine and telegram-ui on demand), `.cursor/skills/telegram-market-miniapp`, `.cursor/agents` (formula-auditor, release-reviewer), `.cursor/references.md`.
- No `package.json`, source, or product dependencies yet. Scaffold is STEP 3.
- Node v26.13.0 and npm 11.6.2 run. Git 2.42.0 is installed; this folder is not a git repository.
- `pnpm` resolves to `C:\Program Files\nodejs\pnpm.CMD`, a Corepack shim. `node_modules\corepack` is missing, `corepack` is not on PATH, and `pnpm -v` fails with `MODULE_NOT_FOUND` for `corepack\dist\pnpm.js`.

Pending approvals:
- Confirm units and dimensional consistency of the USD formula.
- Confirm the quote units/currency for all market prices.
- Approve API provider(s) after checking browser CORS and commercial terms.

Latest verified checks:
- `node -v` → v26.13.0
- `npm -v` → 11.6.2
- `pnpm -v` → failed (`MODULE_NOT_FOUND` corepack pnpm.js)
- `git --version` → git version 2.42.0.windows.2
- `git status` → fatal: not a git repository

Blocker before STEP 3:
- Install a working pnpm (Corepack is absent). Do not scaffold until `pnpm -v` succeeds.

Next action:
- Wait for `بعدی`. STEP 1 is API and formula-unit research only; no product coding.
