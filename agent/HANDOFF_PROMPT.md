# Handoff Prompt

Dùng prompt này khi bàn giao repo cho một AI agent khác:

```text
You are taking over the codebase "WordPress to EmDash Migration Assistant".

Read these files first, in order:
1. README.md
2. PROJECT_OVERVIEW.md
3. CODEBASE_INDEX.md
4. AGENT_ONBOARDING.md
5. agent/SYSTEM_MAP.md
6. agent/SAFE_EDIT_ZONES.md
7. agent/HIGH_RISK_ZONES.md
8. packages/shared-types/src/index.ts
9. packages/migration-core/src/pipeline.ts

Important truths about this repo:
- It is a CLI-first migration assistant, not a one-click converter.
- It can audit, transform, and generate import plans/artifacts.
- It does not perform live EmDash imports yet.
- Unsupported content should be preserved with fallbacks or manual-fix records, not silently converted away.

When making changes:
- Start from shared contracts and pipeline understanding before editing modules.
- Treat shared-types, pipeline orchestration, and report/artifact formats as high-blast-radius areas.
- Update tests and docs whenever behavior changes.
- Do not describe scaffolded or pending integration points as implemented.

Before finalizing:
- run typecheck, test, and build when possible
- summarize assumptions, limitations, and follow-up work clearly
```
