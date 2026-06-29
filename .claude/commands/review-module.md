---
description: Invoke the supervision-verifier on the most recently completed module.
---

Run the **supervision-verifier** agent on the latest module.

1. Determine the scope under review: the staged/last-committed diff, or the module the user
   names in `$ARGUMENTS`.
2. Launch the `supervision-verifier` agent with that scope. Point it at `CLAUDE.md` §7
   (Definition of Done), `docs/spec.md`, and `.claude/skills/api-contract/SKILL.md`.
3. It must actually run the build and tests for the touched app (`npm run build`, test suite)
   and adversarially probe auth/authz/ownership/data-integrity — not just read the code.
4. Surface its verdict verbatim: **PASS** or **FAIL** with a numbered list of required fixes.
5. If FAIL, hand the fixes to the responsible agent (`backend-engineer` / `frontend-engineer` /
   `integration-agent`), then re-run this command until PASS.

A module is **not done** until the verdict is PASS.
