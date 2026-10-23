# PrecisionBridge AI — 7-hour demo prototype (deploy to Vercel)

Build a working, deployable demo of **PrecisionBridge AI** from the PRD in `docs/PRD.md`. I have **7 hours total** and must submit a live Vercel URL. Speed and a reliable demo matter more than completeness. Do not stop to ask for approval; make sensible assumptions, log them in `docs/DECISIONS.md`, and keep moving. Commit after each step.

## Scope: build ONLY the PRD §18 storyboard, scenes 1–5
1. Enrollment: synthetic patient **DM-042** (type 2 diabetes, kidney-condition flag, prefers avoiding hypoglycemia, renal labs unverified) with provenance tags.
2. Routine check-in → safety state ROUTINE → clinician sees option cards with evidence and a "renal status needs review" caution.
3. Clinician requests more data and signs a decision → patient view shows only the approved follow-up, never draft options.
4. Switch to **DEP-017** (depression), submit a check-in with PHQ-9 item 9 positive → URGENT: immediate help text shown, option comparison blocked, alert created and shown as "not yet acknowledged" until a clinician acknowledges it.
5. Research view: consent-gated synthetic cohort, subgroup response table with n/N and missing follow-up, cells under 10 shown as "<10", a non-causality banner, and one exploratory hypothesis the researcher can dismiss or send to scientific review. It must never appear in patient option cards.

**Out of scope (list in `docs/LIMITATIONS.md`):** real DB, real auth, trial pre-screen, exports, LLM features, admin module upload, KPI dashboard.

## Stack (keep it simple)
- Next.js App Router + TypeScript + Tailwind + shadcn/ui + Recharts. Static-friendly, no database.
- **State:** all data seeded deterministically in code (fixed seed). App state (check-ins, decisions, alerts, consents, audit log) in a Zustand store persisted to localStorage, with a visible **"Reset demo"** button that reseeds.
- **Roles:** a top-bar role switcher (Patient / Clinician / Researcher). Each route checks role and shows "Access denied" (and logs it) if wrong. Note in LIMITATIONS that a production build would enforce this server-side.

## Core logic (pure TypeScript in `/src/core`, unit-tested)
- **Module manifests** (JSON) for hypertension, T2D, depression: check-in questions, required profile fields, red-flag rules as declarative data, option cards with evidence refs. Core code must not branch on disease id.
- **Safety engine:** returns `URGENT | PROMPT_REVIEW | ROUTINE | UNABLE_TO_ASSESS` with triggered rule ids. Missing required data never returns ROUTINE. Any thrown error → UNABLE_TO_ASSESS. Structured red-flag answers override free text.
- **Option comparison:** blocked unless state is ROUTINE or PROMPT_REVIEW; missing critical fields → "manual review required"; each card shows drug class only (no doses, no success probabilities), status (eligible_for_review / requires_manual_review / excluded_by_rule), evidence source + version + date, and "Illustrative content — pending clinical review."
- **PGx:** only if a valid report exists and the drug–gene pair is in the module; otherwise "No actionable PGx conclusion."
- **Research:** include only records with research consent on; no names or IDs; suppress n < 10.
- **Audit log:** append entries for check-ins, safety evaluations, alerts, decisions, consent changes and denied access. Show it in a simple table.

## Seed data
~60 synthetic patients (20 per condition), 3–5 check-ins each, deterministic. Include DM-042 and DEP-017 exactly as above, some consent-off patients, some missing-data cases, and enough T2D patients for a subgroup table with at least one suppressed cell.

## UI
Clean, calm clinical look. On every page: banner `SYNTHETIC DATA — NOT FOR CLINICAL USE` and "Demo only". Status shown with icon + text, not color alone. Landing page explains the two wings and links to each role.

## Tests (Vitest, quick)
T01 self-harm → URGENT and comparison blocked; T02 severe low glucose → URGENT; T05 missing kidney data → manual review; T06 free text "fine" + positive red flag → still URGENT; T07 no PGx → no conclusion; T09 consent off → excluded from cohort; T11 n < 10 suppressed; T15 engine error → UNABLE_TO_ASSESS.
