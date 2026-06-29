---
description: Scope and start the next module in the phased build.
---

Scope and kick off the next module from the phased plan in `CLAUDE_CODE_PROMPT.md`.

1. Identify the next unbuilt module in phase order (`$ARGUMENTS` may name it explicitly).
2. Restate its **acceptance criteria**, tracing each to a requirement in `docs/spec.md` and the
   relevant part of `CLAUDE.md` / `.claude/skills/api-contract/SKILL.md`.
3. Choose the owning agent: `backend-engineer`, `frontend-engineer`, `design-system`, or
   `integration-agent`. Brief it with the scope, the contract, and the Definition of Done.
4. Build the module, then commit with a Conventional Commit message (one logical commit;
   see `.claude/skills/commit-discipline/SKILL.md`).
5. Run `/review-module` (supervision-verifier). Fix findings until PASS.
6. Report what was built and what's next; stop at phase boundaries for go-ahead.
