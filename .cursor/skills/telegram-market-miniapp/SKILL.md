---
name: telegram-market-miniapp
description: Use for planning or implementing this Telegram Mini App, its market-data integrations, financial calculations, UI, testing or release. Read only the relevant project docs for the current task.
---

# Project workflow

1. Read `docs/WORKFLOW.md` and `docs/PROGRESS.md`.
2. Read only the relevant section of `docs/PROJECT_SPEC.md`; for formula or price work, read `docs/FORMULAS.md`.
3. Inspect existing files before editing; reuse the current stack and patterns.
4. Execute only the step explicitly authorized by the user. Stop after that step.
5. After a completed step, update `docs/PROGRESS.md` with evidence; never mark incomplete work done.
6. Run only relevant checks, then report changed files, commands/results, blockers and next step concisely.
7. Do not load every reference or folder. Search for and read only files needed for the current task.
8. Use subagents only for genuinely independent, high-risk research or final verification. Avoid spawning agents for routine edits because separate contexts add cost.
9. Do not repeat full project requirements in chat; these project documents are the source of truth.
10. For Telegram, Decimal, Zod, Vite, React, or Tailwind behavior, read `.cursor/skills/source-repos/SKILL.md` and open only the matching repository. For Persian replies, read `.cursor/skills/persian-rtl/SKILL.md`.
