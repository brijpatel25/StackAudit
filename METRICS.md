# METRICS.md

## North Star Metric

**Qualified leads generated per week** — defined as: email captures where `total_monthly_savings > $200`.

**Why this and not others:**
- "Audits completed" is vanity — a solo dev saving $0 is not business value for Credex
- "Emails captured" includes the no-savings/low-savings cases that have near-zero conversion to Credex customers
- "Consultations booked" is too far downstream to optimize against quickly
- Qualified leads (>$200/mo savings potential) are the direct input to Credex's sales pipeline and directly predictable from tool behavior

A week where qualified leads double means the business pipeline doubled. A week where total audits double but qualified leads stay flat means we're acquiring the wrong users.

---

## 3 Input Metrics That Drive the North Star

**1. Audit completion rate** (audits completed / audits started)
- Current target: ≥60%
- Drives: more qualified leads from same traffic
- If this drops: form is too long, confusing, or mobile-broken
- How to improve: reduce form steps, pre-fill common combinations, add progress indicator

**2. Average savings found per audit**
- Current target: ≥$150/mo per completed audit
- Drives: what fraction of completed audits become "qualified leads"
- If this drops: we're attracting low-spend users (solopreneurs) rather than team managers
- How to improve: SEO/distribution targeting team leads vs individuals, benchmark language ("teams your size average $X")

**3. Audit-to-email conversion rate**
- Current target: ≥20% of completed audits
- Drives: raw email capture volume
- If this drops: email gate copy isn't compelling, or users don't trust us with their email
- How to improve: stronger value proposition in email gate, social proof on results page, show "Credex will review this personally" for high-savings cases

---

## What to Instrument First

In priority order:

1. **Audit started** — event on first tool toggle (not page load — measures intent)
2. **Audit completed** — event on successful `/api/audit` response
3. **Results viewed** — event on `/audit/[id]` page load
4. **Email captured** — event on successful `/api/leads` response
5. **High-savings threshold crossed** — event when `total_monthly_savings > 500` (Credex CTA shown)
6. **Share URL copied** — event on copy button click (viral loop measurement)
7. **Consultation CTA clicked** — event on Credex consultation link click

Simple implementation: `fetch('/api/event', { method: 'POST', body: JSON.stringify({ event, properties }) })` — write to Supabase `events` table, query with basic SQL. No need for a third-party analytics tool until >10k events/day.

---

## Pivot Triggers

**Pivot from current model if:**

- **Audit completion rate < 35% after 500 starts:** Form is too long or confusing. Pivot to a simpler "3-question" version: which category (coding/writing/research), rough monthly spend bucket, team size. Lose precision, gain completion.

- **Qualified lead → Credex consult rate < 5% after 50 qualified leads:** The connection between "here are your savings" and "book a Credex call" isn't landing. Pivot the CTA framing or test a different conversion mechanism (e.g., free "savings implementation guide" PDF).

- **Average savings per audit < $50 after 200 audits:** We're attracting too many solo users or already-optimized teams. Pivot distribution to explicitly target teams 10+ seats, change hero copy to "for engineering teams spending $500+/mo on AI."

- **Zero Credex customers from 20+ consultations booked:** The tool is generating leads but Credex can't close them. This is a sales/product-market fit problem at Credex, not a tool problem. Pivot to licensing the tool to other consultancies or adding a self-serve "optimization report" paid product ($49 one-time).
