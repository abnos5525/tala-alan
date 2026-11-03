# Step-by-step workflow

Execute one step per explicit user approval. After each step, stop. Continue only when the user says `بعدی` or `برو بعدی`.

0. Inspect repository and toolchain; verify this Cursor setup; report findings. Do not implement product features.
1. Research and compare browser-compatible, commercially permitted APIs; resolve formula units and obtain approval. No product coding.
2. Propose architecture, folder layout and dependency list; obtain approval.
3. Scaffold or adapt React/Vite/TypeScript/Tailwind using pnpm.
4. Implement market-data adapters, runtime validation, freshness and source-conflict handling.
5. Implement pure Decimal-based calculation engine and unit tests.
6. Implement Persian RTL dashboard and all loading/error/stale/offline states.
7. Integrate Telegram Mini Apps SDK and BotFather launch configuration; no bot server.
8. Run final checks and one focused review cycle: build, typecheck, lint, tests, security and Telegram/mobile review. Use specialist subagents only where independent review adds value.
9. Provide deployment instructions and a concise operator guide.

## After each step
Report only:
- What changed.
- Files created/modified.
- Commands/tests and actual results.
- Open questions/blockers.
- Next step.

Update `docs/PROGRESS.md` only after the step is genuinely complete. Never claim a command or test passed unless it was actually run. Do not make unrelated changes. Do not repeat all project docs in chat.
