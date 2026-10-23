# Deployment
- Production URL: https://precisionbridge-ashy.vercel.app
- Vercel project: appam1/precisionbridge
- Deployment ID: dpl_8EaT9g7rfWKcUKy5bo5LoWdAAHyJ
- Deployment status: READY (verified 24 October 2026, Asia/Kolkata)
- Inspector: https://vercel.com/appam1/precisionbridge/8EaT9g7rfWKcUKy5bo5LoWdAAHyJ

Public unauthenticated HTTP checks returned 200 for /, /patient/, /clinician/, /research/ and /audit/. Role-specific content is still gated client-side after hydration; this is intentionally a synthetic demo, not a production authorization boundary.

Live browser checks confirmed clinician renal-review cards, patient urgent escalation and the consent-gated research table. Reset restored clean state for the demonstration. No secrets or real patient data are required by the app.

## Redeploy
From this project folder, with a Vercel-authenticated CLI:
```sh
npx vercel deploy --prod --project precisionbridge --scope appam1
```

Vercel's Next.js adapter reads metadata from .next; the local static server serves out/. Do not set the Vercel Next.js output-directory override to out, because the adapter expects its routes manifest in the build-metadata directory.

The initial failed build is retained under appam1/precisionbridge-ai-mvp for diagnostic history. Its failure was only a Vercel output-directory mismatch; the final app is hosted by appam1/precisionbridge.
