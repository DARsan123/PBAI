# PrecisionBridge AI

Live demo: https://precisionbridge-ashy.vercel.app

Synthetic, clinician-supervised personalized medicine MVP. Implements storyboard scenes 1–5 from the supplied PRD and build procedure.

**SYNTHETIC DATA — NOT FOR CLINICAL USE. Demo only.**

## Run
Requires Node.js 22 or 24 and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. On this computer, dependencies are already installed and Node is available; you can also run:

```powershell
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000
```

## Verify and export
```sh
npm test
npm run typecheck
npm run build
```

The production static site is written to `out/`. Run `npm start` to preview that build at http://127.0.0.1:3000. Serve over HTTP; opening index.html with file:// does not support application routing.

## Deploy to Vercel
```sh
npx vercel login
npx vercel --prod
```

The checked-in Vercel config selects the Next.js adapter and its .next build metadata. The adapter handles the static export; local static preview uses out/. No environment variables, database or external AI key are needed. Source documents and tests are excluded from deployment uploads using .vercelignore. A temporary unauthenticated deployment, if supplied separately, should be claimed in Vercel before its expiry.

## Five-scene walkthrough
1. Open Patient workspace. DM-042 shows type 2 diabetes, a kidney-condition flag, a preference to avoid hypoglycemia and unverified renal labs. Review separate clinical and research consent.
2. Submit the default non-urgent check-in. It returns ROUTINE. Switch to Clinician; option cards require manual review because renal status is unknown.
3. Select Request more data, enter a rationale and patient follow-up, review the checkbox and sign. Switch to Patient to see only the signed follow-up. Subsequent decisions append new versions.
4. Select DEP-017 in Patient. Enter 1 for PHQ-9 item 9 and optionally “fine” in the free-text note. Submit. URGENT guidance appears immediately, an unacknowledged alert is created, and comparison is blocked. In Clinician, acknowledge the alert; it remains open until resolution with rationale. A new safe check-in and resolution are both needed before comparison resumes.
5. Switch to Researcher. Inspect the eight-week synthetic outcome table. Small counts and revealing totals are withheld. Dismiss the illustrative question or send it for scientific review. These actions do not alter care.

Try a wrong-role route to see Access denied. Audit trail is clinician-only. Reset demo restores the same 60 records, 3–5 historical check-ins each, and clears browser changes.

## Architecture
- Next.js App Router + TypeScript + Tailwind CSS.
- Local shadcn-style Button with Radix Slot and class-variance-authority.
- Recharts for synthetic longitudinal observations.
- Zustand persisted in localStorage, schema version 1.
- JSON disease manifests under `src/modules`.
- Pure safety, option, PGx and research logic under `src/core`.
- No disease-id branches in safety/comparison engines.
- Role checks on routes and mutation actions; client-only, not production authorization.

Read docs/LIMITATIONS.md, docs/DECISIONS.md and docs/VERIFICATION.md before presenting. All clinical content is illustrative and pending qualified clinical review.
