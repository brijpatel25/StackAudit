# REFLECTION.md

## 1. Hardest bug — and how I debugged it

The hardest bug was the cross-tool redundancy detection for Cursor + GitHub Copilot, which was silently not triggering in certain cases.

The symptom: a user with both Cursor Pro and GitHub Copilot Business wasn't getting the redundancy warning. I knew the rule existed and had a test that passed. So why wasn't it showing in the UI?

**Hypothesis 1:** The test was wrong. I ran the test in isolation — it passed. The engine was detecting redundancy correctly in isolation.

**Hypothesis 2:** The form wasn't passing both tools. I added a `console.log` to the API route and confirmed both tools appeared in the input array. Dead end.

**Hypothesis 3:** The rule was running but the result was being overwritten. I traced through the code — `auditCopilotVsCursor` runs after per-tool rules and replaces the existing copilot recommendation. But there was a bug: the replacement logic was checking `r.toolId === 'github_copilot'` to find the existing recommendation to replace — but if the user had Copilot Business and the per-tool rule returned an `ok` recommendation (not the correct downgrade), the cross-tool rule was replacing it correctly. For Copilot Individual, though, the per-tool audit returned `ok` severity with the toolId as `github_copilot` — and the replacement was working. So why wasn't it showing?

Eventually found it: the array `indexOf` was using reference equality, not value equality. The replaced recommendation had `toolId: 'github_copilot'` but I was checking for it after a `sort()` call that changed array order — the `indexOf` was finding the wrong element. Fixed by searching by `toolId` string comparison explicitly. The bug was subtle because my test didn't sort the recommendations before asserting.

**Lesson:** Test the full pipeline, not just the subfunction. And always verify the state of data after sort operations.

---

## 2. A decision I reversed mid-week

I originally built the form as a single long page: all 8 tools expanded simultaneously with their plan/seats/spend fields, team size, and use case all visible at once.

By Day 5 I'd reversed this into a 2-step flow (Step 1: select tools, Step 2: configure + context).

What made me change: during user interviews, one person said "I felt like I needed to read everything before I could start." The single-page form looked like 15+ form fields before you'd even started. Cognitively overwhelming.

The 2-step approach — first a grid of tool toggles (quick, visual, low-friction), then configuration for only the selected tools — dramatically reduced the "form anxiety." The audit summary at the bottom of Step 2 also gave users a "preview" moment before submitting, which interviewees responded positively to.

Technically, this required restructuring the form state and adding a step indicator. It added ~2 hours of work but made the product meaningfully better.

---

## 3. What I'd build in week 2

In priority order:

**1. Dynamic OG images** — Currently the share preview is text-only. A `@vercel/og` image that shows the big savings number in Playfair Display with the tool list would dramatically improve click-through rates from Twitter/LinkedIn shares. This is the highest-leverage week-2 feature for growth.

**2. PDF export** — The spec lists this as a bonus. A clean one-page PDF with the full audit, suitable for forwarding to a CFO or sharing in Slack, would increase lead quality. Users who export are more likely to act.

**3. Benchmark mode** — "Your AI spend per developer is $X — companies your size average $Y." This requires a database of aggregated audit data (which starts accumulating after launch) and a way to segment by team size and use case. Not possible in week 1 without data, but a clear week-2 feature.

**4. Redundancy detection expansion** — User interviews revealed a pattern of same-category tool overlap (ChatGPT + Claude, Cursor + Windsurf + Copilot all at once). The engine handles Cursor+Copilot but not ChatGPT+Claude redundancy. Worth adding rules for all same-category pairs.

**5. Savings notification email** — "We'll email you when new savings apply to your stack." Requires storing the tool configuration per lead and running a weekly diff against updated pricing data. Turns one-time visits into a retention mechanism.

---

## 4. How I used AI tools

**Claude (claude.ai):** Used heavily for initial architecture planning — walked through the spec and asked for a system diagram and file structure before writing a line of code. This saved ~2 hours of upfront thinking. Also used for writing first drafts of the longer markdown files (GTM.md, ECONOMICS.md) which I then edited significantly.

**Claude Code:** Used for iterating on the audit engine logic — specifically asking "what edge cases am I missing in the Cursor Business rule?" which surfaced the "what if they have exactly 10 seats" boundary condition I'd missed. Also used for CSS — described the editorial aesthetic I wanted and iterated on the Tailwind classes.

**What I didn't trust AI with:** The pricing data. I verified every number manually against official vendor pages. AI-provided pricing would have been stale (models have cutoffs) and wrong numbers would have invalidated the entire product's credibility.

**One time the AI was wrong:** I asked Claude to suggest a prompt for the summary generator and it included "List 3 specific recommendations" — which would have produced bullet points, conflicting with the single-paragraph prose design of the results page. Caught immediately and corrected. The AI optimized for helpfulness (more specificity = more helpful) without understanding the design constraint.

---

## 5. Self-ratings

**Discipline: 7/10**
Stuck to the plan most days but lost ~1 hour on Day 3 over-polishing CSS animations before the core functionality was finished.

**Code quality: 7/10**
The audit engine is clean, typed, and testable. The React components are functional but have some prop-drilling that a context provider or state manager would clean up. No technical debt that blocks the MVP.

**Design sense: 8/10**
The editorial aesthetic is deliberate and differentiated — it looks nothing like a typical SaaS tool. The results page is screenshot-worthy. Lost a point for not doing dynamic OG images, which would have completed the visual story.

**Problem-solving: 8/10**
The Cursor+Copilot redundancy bug took longer than it should have because I didn't add enough logging early. But the process was systematic — form hypotheses, test each, eliminate. No "try random things and see what sticks."

**Entrepreneurial thinking: 7/10**
The GTM plan is specific (particular Slack groups, X lists, specific subreddits). The economics math is real even if inputs are estimates. Lost a point because I didn't push harder on the viral loop — the share URL exists but the OG image that makes it actually spread is missing.
