# ECONOMICS.md — Unit Economics

## What a Converted Lead is Worth to Credex

Credex's core product is AI credits/spend management. Assume:
- Average contract value (ACV) for a Credex customer: **$8,000/year** (conservative for a 10–50 person startup spending $2k–$10k/mo on AI)
- Gross margin on Credex product: **60%** (typical for SaaS with some service component)
- Customer lifetime: **2 years** average

**LTV per converted customer = $8,000 × 60% × 2 = $9,600**

Even at a 50% discount to account for churn uncertainty: **LTV ≈ $4,800 per customer.**

---

## CAC at Each GTM Channel

| Channel | Estimated Reach | Conversion to Audit | Conversion to Lead | Conversion to Customer | Implied CAC |
|---------|----------------|--------------------|--------------------|----------------------|-------------|
| Hacker News Show HN | 500 visitors | 30% (150 audits) | 25% (38 emails) | 5% (2 customers) | $0 |
| Twitter thread | 2,000 impressions | 5% (100 clicks) | 20% (20 emails) | 3% (0.6 customers) | $0 |
| Subreddit posts | 1,000 views | 8% (80 audits) | 20% (16 emails) | 3% (0.5 customers) | $0 |
| Credex customer email | 500 warm leads | 40% (200 audits) | 35% (70 emails) | 8% (5.6 customers) | $0 (marginal) |
| Product Hunt | 800 visitors | 25% (200 audits) | 22% (44 emails) | 4% (1.8 customers) | $0 |

All $0 CAC channels in week 1. Once paid, estimate:
- LinkedIn targeted ads to CTOs: **~$80 CPC** → $80/audit started → $320/lead → **$10,700 CAC** (not profitable at current LTV)
- SEO content: ~$2,000 in content creation → 500 organic visitors/month by month 6 → **~$400 CAC**

**Conclusion:** Organic/community channels are the only profitable CAC at this stage. Paid makes sense only after LTV is proven higher.

---

## Conversion Funnel Math

```
Audit started     → 100%
Audit completed   → 65%   (drop-off: confused by form, mobile issues)
Results viewed    → 95%   (of completed — they almost always see it)
Email captured    → 22%   (of results viewed — value shown first, so high)
High-savings lead → 15%   (of email captures — >$500/mo savings)
Consult booked    → 25%   (of high-savings leads — warm, motivated)
Customer closed   → 30%   (of consultations booked)
```

**Conversion: audit started → customer = 0.65 × 0.95 × 0.22 × 0.15 × 0.25 × 0.30 ≈ 0.15%**

At 1,000 audits/month: **1.5 new customers/month**

At $4,800 LTV: **$7,200/month in LTV generated** from 1,000 audits

---

## What Has to Be True for $1M ARR in 18 Months

$1M ARR = $83,333 MRR = ~10.4 new Credex customers/month (at $8,000 ACV)

Working backwards from the funnel:
- 10.4 customers/month requires **6,900 completed audits/month**
- At 30% completion rate: **23,000 audit starts/month**
- At month 18, that's reasonable for a tool with organic growth + a small SEO footprint

**What has to be true:**
1. **ACV is actually $8k+** — requires Credex closing deals, not just generating leads. The consultation-to-close rate matters enormously.
2. **The tool retains users** — a weekly "new savings available for your stack" email keeps the tool top-of-mind and creates re-engagement. Without retention, every month starts from zero.
3. **Viral coefficient ≥ 0.3** — each user generates 0.3 referrals via the share URL. At 6,900 audits/month, 0.3 coefficient = 2,070 referred audits (30% of acquisition is free/organic).
4. **Pricing data stays current** — the tool's credibility depends entirely on accurate pricing. One wrong number that users catch kills trust. Needs a monthly pricing verification process.
5. **Credex closes fast** — if consultation → close takes 90+ days, the LTV math takes 18 months just to validate. Need a short-cycle product motion (30 days consult → close).

**Rough 18-month model:**

| Month | Audits/mo | Customers added | Cumulative ARR |
|-------|-----------|-----------------|----------------|
| 1–2 | 500 | 0.8 | $6,400 |
| 3–4 | 1,500 | 2.3 | $24,800 |
| 6 | 4,000 | 6 | $82,000 |
| 9 | 8,000 | 12 | $220,000 |
| 12 | 14,000 | 21 | $490,000 |
| 15 | 20,000 | 30 | $800,000 |
| 18 | 28,000 | 42 | $1,100,000 |

Assumes 15% MoM growth in audits from organic + SEO compounding. Aggressive but not impossible for a free tool with viral mechanics in a cost-conscious market.
