# Implementation decisions
- The procedure limits the broader PRD to scenes 1–5. No seven-hour unattended goal was inferred.
- Next.js App Router, TypeScript, Tailwind, shadcn local Button primitive, Recharts and persisted Zustand state; static export for Vercel.
- Acute safety completeness and critical profile completeness are separate. Missing safety answers fail closed; missing renal verification restricts option review.
- All clinical rules and option cards are illustrative and pending clinical review. Evidence references are contextual starting points, not clinical approval.
- Fixed seed 42017; 60 synthetic adults, 20 per condition and 3–5 historical check-ins.
- All counts below ten are suppressed, including numerators and missing outcomes. Percentages and complements that reveal small cells are withheld. Only fixed baseline groups are available.
- Urgent alerts block comparison until explicit clinician resolution. Acknowledgment alone does not resolve an alert.
- Signed decisions are append-only snapshots. Research dispositions cannot alter option cards.
- Client role checks demonstrate workflow only; production authorization must be server-side.
- Requested hosting is Vercel; do not silently substitute a different service. A live deployment requires an authenticated account.
- Windows static export intermittently returned EPERM while creating directories. The build launcher retries only that transient mkdir error for a bounded interval; Linux/Vercel use the normal Next build path. One worker reduces filesystem contention.

## Incremental v2 — 2026-10-24
Base master and original production deployment remain unchanged. v2 uses a separate branch, worktree, Vercel project, Neon free corpus database and localStorage key. Optional AI follows the existing deterministic workflow. See V2-CHANGES.md.

Gemini 3.8 Flash returned HTTP 503 in live generation while embeddings and pgvector succeeded. Deployment model changed to the documented stable Gemini 3.6 Flash through GEMINI_MODEL; default remains 3.8 for future configuration.
