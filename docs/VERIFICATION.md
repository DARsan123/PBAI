# Verification record

Dates: 23–24 October 2026 (Asia/Kolkata).

## Automated checks
- Vitest: 28 tests passed.
- TypeScript strict check passed.
- Required cases T01, T02, T05, T06, T07, T09, T11 and T15 are covered.
- Additional coverage: all three modules, deterministic 60-record seed, required-data validation, optional-data handling, verified allergy exclusions, missing evidence, unresolved urgent alert lockout, role/action denials, clinical consent, alert acknowledgment/resolution, append-only signed versions, research isolation, reset, complementary suppression and class-specific PGx annotation.
- Final Next.js production build passed: all 8 static pages generated. Windows directory retries resolved transient EPERM errors without bypassing filesystem permissions.

## Browser walkthrough
Verified using the in-app browser at narrow and desktop viewports:
- Landing and responsive stacked layout render; desktop production layout visually inspected.
- DM-042 provenance and unknown renal field appear correctly.
- Routine check-in submission adds a timestamped timeline event.
- Clinician cards show manual renal review, evidence drawers and no PGx conclusion.
- Signed follow-up appears in Patient, with draft options absent.
- DEP-017 item 9 = 1 with free text “fine” produces URGENT guidance and a not-yet-acknowledged alert.
- Acknowledge changes status but leaves comparison blocked.
- Research table has no patient IDs and displays suppression/non-causality copy.
- Scientific-review action updates research disposition.
- Researcher direct navigation to clinician route returns Access denied after reload.
- Browser testing found and fixed a hydration ordering bug that overwrote saved role state. Production check-in and Patient role persist after reload.

## Limits
No clinical validity, production security, real notification delivery, full accessibility certification, performance SLO or broad device/browser coverage is claimed. Narrow and desktop browser views were inspected. Other devices and browsers have not been tested.
\nLive Vercel deployment verified READY on 24 October 2026. Public routes returned HTTP 200. Browser smoke checks passed for clinician review, patient urgent escalation and research aggregates.
