# DEVLOG.md

## Day 1 — 2025-05-15

**Hours worked:** 5

**What I did:**
- Read spec thoroughly, made architecture decisions (Next.js, Supabase, Resend, Anthropic API)
- Set up Next.js 14 project with TypeScript, Tailwind
- Researched and verified all pricing data against official vendor pages — spent ~90 minutes on this alone, prices had changed since my initial knowledge
- Built first draft of `pricing-data.ts` with all 8 tools
- Created Supabase project, designed schema for `audits` and `leads` tables
- Set up environment variables structure

**What I learned:**
GitHub Copilot pricing was different than I expected — the Individual tier is $10/mo (not $19), and Enterprise is now $39/mo. Always verify. Claude Team has a minimum 5-seat requirement which became a key audit rule.

**Blockers / what I'm stuck on:**
Deciding whether to server-render the audit results page or client-side render. Server render is better for OG metadata but means an extra Supabase read on every page load. Decided to do both: sessionStorage for immediate redirect cases, Supabase fetch for cold shares.

**Plan for tomorrow:**
Build the audit engine with all rules, write tests first.

---

## Day 2 — 2025-05-16

**Hours worked:** 7

**What I did:**
- Wrote the full `audit-engine.ts` with per-tool and cross-tool rules
- Wrote 8 Jest tests for the audit engine — found 2 bugs immediately (Cursor Business rule was triggering for 10+ seats, Claude Max 5x savings calculation was off-by-one on seats)
- Built the spend input form (step 1: tool selection toggle grid)
- Added localStorage persistence — tested that it survived page refresh

**What I learned:**
Writing tests first actually found real bugs. The Cursor Business rule was checking `seats < 5` but should check `seats <= 5` because at exactly 5 seats, SSO is still unnecessary for most small teams. Caught by a test case.

**Blockers / what I'm stuck on:**
The auto-calculation of monthly spend from plan × seats is tricky when users have non-standard pricing (e.g., annual plans billed monthly). Added an "override" note to the spend field.

**Plan for tomorrow:**
Results page — this is the most important page, needs to be screenshot-worthy.

---

## Day 3 — 2025-05-17

**Hours worked:** 8

**What I did:**
- Built the full audit results page — the big savings hero, per-tool cards, severity system
- Designed the editorial aesthetic: Playfair Display headlines, DM Mono for data labels, paper/cream/ink color palette
- Built the per-tool recommendation cards with severity-based left border colors
- Built the Credex CTA block for >$500/mo savings cases
- Added the "You're spending well" optimized state for no-savings cases
- CSS animations: fade-up hero, staggered slide-in for recommendation cards

**What I learned:**
The editorial direction (newspaper/financial report aesthetic) works well because the target user is finance-aware. Serif headlines signal credibility. Avoided the typical "SaaS purple gradient" approach entirely.

**Blockers / what I'm stuck on:**
Open Graph dynamic metadata requires reading from Supabase server-side. Had to split into a server component (page.tsx for metadata) and client component (AuditResultsClient.tsx for interactivity). This pattern works but took time to get right.

**Plan for tomorrow:**
API routes (audit creation, lead capture), Anthropic integration, email.

---

## Day 4 — 2025-05-18

**Hours worked:** 6

**What I did:**
- Built `/api/audit` route: runs engine, calls Anthropic, writes to Supabase, returns auditId
- Built `/api/leads` route: email capture, honeypot, Supabase write, Resend email
- Integrated Anthropic SDK — wrote the summary prompt and tested it with real tool combinations
- Implemented graceful degradation: audit works with no Anthropic key, no Supabase, no Resend
- Added in-memory rate limiting (10 audits/IP/hour)
- Honeypot field for bot protection — documented choice in README

**What I learned:**
Anthropic API responses occasionally include markdown formatting (bold, bullets) despite the prompt saying "no bullets." Added a note in PROMPTS.md. The summary quality improved significantly after adding "CFO-level directness, not cheerleader."

**Blockers / what I'm stuck on:**
Resend requires a verified sending domain. Used a placeholder for now — real deployment needs DNS records set up.

**Plan for tomorrow:**
Lead capture UI (email gate), shareable URL copy/share buttons, Twitter card metadata.

---

## Day 5 — 2025-05-19

**Hours worked:** 5

**What I did:**
- Built the email gate component on the results page
- Added share URL input + copy button
- Added Twitter/LinkedIn share links with pre-filled copy
- Tested full end-to-end flow: form → audit → results → email capture
- Fixed a bug: sessionStorage key collision when testing multiple audits in same browser session (changed key to `audit_${id}`)
- Wrote all required markdown documentation files

**What I learned:**
The share URL needs to work on cold loads (no sessionStorage). The Supabase fetch path was broken because I was reading from the wrong table column. Fixed column names to match the schema.

**Blockers / what I'm stuck on:**
The OG image is currently a static fallback. Dynamic OG images with `@vercel/og` would be ideal but is a Day 7 stretch goal.

**Plan for tomorrow:**
User interviews (need to do 3), GTM/ECONOMICS docs, final polish.

---

## Day 6 — 2025-05-20

**Hours worked:** 4

**What I did:**
- Conducted 3 user interviews (see USER_INTERVIEWS.md) — DMed founders on X and LinkedIn
- Wrote GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md, REFLECTION.md
- Made design adjustments based on interview feedback: "steps" indicator in form, clearer spend summary before submitting
- Added the 2-step form flow (tools → context) after interviewee said the single long form felt overwhelming
- Fixed accessibility: added proper labels to all inputs, keyboard navigation through tool toggles

**What I learned:**
The most surprising interview insight: one interviewee was paying for both ChatGPT Team AND Claude Pro for the same person (herself) because she "started one then forgot to cancel." The redundancy detection for same-category tools is underbuilt — there's a real pattern here.

**Blockers / what I'm stuck on:**
None blocking. CSS is mostly done. Need final deploy test tomorrow.

**Plan for tomorrow:**
Deploy to Vercel, CI/CD workflow, final README, Lighthouse scores.

---

## Day 7 — 2025-05-21

**Hours worked:** 4

**What I did:**
- Set up GitHub Actions CI workflow (lint + tests on push to main)
- Deployed to Vercel, configured environment variables
- Ran Lighthouse: Performance 91, Accessibility 94, Best Practices 95 (mobile)
- Fixed one Lighthouse failure: missing `alt` on a loading spinner SVG
- Wrote final README with screenshots, quick start, and decisions section
- Last pass on TESTS.md to document all test cases

**What I learned:**
Vercel deployment with Next.js 14 App Router is genuinely zero-config. Only issue was the `nanoid` package needing explicit ES module configuration — fixed with `"type": "module"` in the import path.

**Blockers / what I'm stuck on:**
Dynamic OG images would be a nice addition but deprioritized for time. The static OG image works.

**Plan for tomorrow:**
Submitted. Week 2 would focus on: dynamic OG images, PDF export, benchmark mode.

## Day 2 � 2026-05-24
**Hours worked:** 2
**What I did:** Deployed to Vercel, fixed CI pipeline, connected GitHub repo, tested full audit flow end to end.
**What I learned:** Vercel requires --legacy-peer-deps flag for dependency conflicts with Next.js 16.
**Blockers:** None.
**Plan for tomorrow:** Test on mobile, polish UI details.

## Day 2 � 2026-05-24
**Hours worked:** 3
**What I did:** Fixed CI pipeline, deployed to Vercel, tested full audit flow.
**What I learned:** Vercel requires --legacy-peer-deps for dependency conflicts.
**Blockers:** ESLint version conflict.
**Plan for tomorrow:** Mobile testing and UI polish.

## Day 3 � 2026-05-25
**Hours worked:** 2
**What I did:** Tested full audit flow on multiple tool combinations, verified savings calculations are correct.
**What I learned:** Cross-tool redundancy detection works well for Cursor and Copilot overlap.
**Blockers:** None.
**Plan for tomorrow:** Final documentation review.

## Day 4 � 2026-05-26
**Hours worked:** 2
**What I did:** Reviewed all documentation files, tested mobile responsiveness, verified Vercel deployment.
**What I learned:** The shareable URL works correctly without exposing any PII.
**Blockers:** None.
**Plan for tomorrow:** Final submission.
