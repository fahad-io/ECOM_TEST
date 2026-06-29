---
name: commit-discipline
description: How to commit on MARL — Conventional Commit messages, one logical commit per module, what to stage and what to ignore. Never a single final dump.
---

# Commit discipline

The git history is reviewed as part of the assessment. It must read as a coherent, incremental
build — not a single "final commit" dump.

## Rules
- **One logical commit per module.** Commit when a module is coherent and (ideally) after the
  supervisor passes it. Do not batch unrelated changes.
- **Conventional Commits**: `type(scope): summary`.
  - Types: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`, `style`.
  - Scope: `backend`, `frontend`, or omit for cross-cutting (`fix:`, `docs:`, `chore:`).
  - Summary: imperative, lowercase, no trailing period. e.g.
    `feat(backend): orders with stock + price integrity`.
- **Commit project infrastructure too** — `CLAUDE.md`, `.claude/`, `docs/`, `.gitignore`,
  README, NOTES. History should show the scaffolding decisions, not just features.
- Commit messages describe *what changed and why*, briefly. The body is optional for small
  modules; use it when a decision needs explaining.

## Staging
- Stage only files relevant to the commit's stated scope.
- **Never stage**: `node_modules/`, `.env` (any), build output (`dist/`, `.next/`),
  `coverage/`, uploaded images under `backend/uploads/*` (keep `.gitkeep`).
- These are covered by `.gitignore`; if `git status` shows any of them, fix `.gitignore`
  rather than committing them.
- Keep `.env.example` committed and in sync; the real `.env` is never committed.

## Don't
- No `git add -A` sweeps that hoover up unrelated work.
- No secrets, tokens, or credentials in any commit (history is permanent).
- No squashing the whole build into one commit at the end.
- Do not push or force-push unless the user explicitly asks.

## Footer
End commit messages created in this project with:

```
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```
