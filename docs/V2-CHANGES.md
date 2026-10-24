# Incremental v2
Base: e2f58a4, preserved in the original checkout and original Vercel project.
Branch: feature/ai-assistance-v2. Separate Vercel project: precisionbridge-v2.

All five existing storyboard scenes and 28 core tests are retained. Five optional AI panels add check-in suggestions, cited option explanations, patient education, change summaries and confirmed research filters. The optional generated hypothesis note is deferred; the original fixed hypothesis review queue remains.

AI values are staged separately and applied only after explicit confirmation. Urgent fields are excluded using declarative module rules. Every patient text input has a synchronous keyword check; server requests repeat it. Keywords are conservative and cannot detect every emergency. Structured safety rules remain authoritative.

The provider adapter uses official @google/genai, a 10-second per-call timeout and one bounded retry for transient provider failures, temperature 0.1, Gemini JSON-schema output and Zod validation. GEMINI_MODEL defaults to gemini-3.8-flash, verified against Google's model catalog on 2026-10-24. Embeddings use gemini-embedding-001 at 768 normalized dimensions. API errors produce a plain-flow fallback.

Neon is a separate free Marketplace resource, used only for the illustrative corpus. Ingestion runs idempotently during Vercel builds when both server credentials are present. Run npm run corpus:ingest to retry. Missing or failed database queries use BM25 over identical, audience/module-filtered JSON. Corpus cards are already short chunks; each is embedded separately. Clinical review is pending; these are workflow paraphrases, not guideline recommendations.

Privacy: app state remains in localStorage (separate v2 key). Only numeric/boolean profile values are sent. Patient language is reduced to a bounded health vocabulary before reaching Gemini, which intentionally loses nuance and may reduce answer quality. No raw free text is included in AI audit events. The browser sends original synthetic text to the server for pre-model safety checks; no identifiers are sent to Gemini. Do not use real health data.

The role in requests, signed-version envelope, and safety-block flag are client asserted because real authentication and server app state remain out of scope. They are demo boundaries, not adversarial authorization. Production needs authenticated server-side patient scope, signed-plan lookup, authoritative safety state, rate limits and abuse controls.

Citation checks ensure all claim ids belong to retrieved passages; they do not establish factual entailment. A clinician must verify explanations. Summary checks reject unseen numeric/date tokens, but do not prove the semantic accuracy of an otherwise valid number. No AI output changes safety, options, signing or consent/suppression logic.
