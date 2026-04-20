# AGENTS.md

## Project
This repository contains TrustCheck, a lightweight web app for evaluating written content for credibility signals.

Read `TRUSTCHECK_SPEC.md` before making product or scoring changes.

## Product Rules
- TrustCheck is a general trustworthiness evaluation tool.
- It is not an AI detector.
- Do not claim to determine truth, falsity, or authorship.
- Version 1 is text-only.
- Do not add video analysis, deepfake detection, accounts, saved history, or other out-of-scope features unless explicitly requested.

## Coding Rules
- Prefer small, focused changes over broad rewrites.
- Preserve existing working behavior unless the task requires a change.
- Keep the UI clean, minimal, and professional.
- Keep code readable and organized.
- Use the existing project structure and naming conventions.

## Analysis Rules
- Follow the weighted rubric in `TRUSTCHECK_SPEC.md`.
- Keep scoring logic transparent and easy to inspect.
- Apply the guardrails from `TRUSTCHECK_SPEC.md`.
- Keep summaries, red flags, and recommendations calm, practical, and non-absolute.

## Workflow
- For larger tasks, explain the plan before making changes.
- After making changes, explain what files changed and why.
- If a change may affect scoring or output behavior, describe the impact clearly.
- Avoid unnecessary dependencies.

## Testing
- Run the relevant local checks before finishing.
- If something cannot be validated, say so clearly.