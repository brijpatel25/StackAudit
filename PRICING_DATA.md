# PRICING_DATA.md

All pricing data used in the StackAudit audit engine. Every number traces to an official vendor pricing page.

---

## Cursor

| Plan | Price | Source | Verified |
|------|-------|--------|----------|
| Hobby | $0/user/month | https://cursor.com/pricing | 2025-05-21 |
| Pro | $20/user/month | https://cursor.com/pricing | 2025-05-21 |
| Business | $40/user/month | https://cursor.com/pricing | 2025-05-21 |
| Enterprise | Custom (contact sales) | https://cursor.com/pricing | 2025-05-21 |

**Notes:**
- Pro: 500 fast premium requests/month, unlimited slow
- Business adds: SSO/SAML, centralized billing, privacy mode enforced, usage dashboards
- Business is the trigger for our "downgrade if ≤5 seats" rule — SSO is the only meaningful differentiator at small team sizes

---

## GitHub Copilot

| Plan | Price | Source | Verified |
|------|-------|--------|----------|
| Individual | $10/user/month ($100/yr) | https://github.com/features/copilot#pricing | 2025-05-21 |
| Business | $19/user/month | https://github.com/features/copilot#pricing | 2025-05-21 |
| Enterprise | $39/user/month | https://github.com/features/copilot#pricing | 2025-05-21 |

**Notes:**
- Individual: IDE completions, Copilot Chat, CLI
- Business adds: policy management, audit logs, IP indemnity, no public code matching
- Enterprise adds: fine-tuning on private repos, knowledge bases, GitHub.com integration
- Audit rule: Enterprise justified at 50+ seats with established proprietary codebase; Business justified at 10+ seats needing policy/audit compliance

---

## Claude (Anthropic)

| Plan | Price | Source | Verified |
|------|-------|--------|----------|
| Free | $0 | https://anthropic.com/claude/pricing | 2025-05-21 |
| Pro | $20/month (individual) | https://anthropic.com/claude/pricing | 2025-05-21 |
| Max (5×) | $100/month | https://anthropic.com/claude/pricing | 2025-05-21 |
| Max (20×) | $200/month | https://anthropic.com/claude/pricing | 2025-05-21 |
| Team | $30/user/month (min 5 seats) | https://anthropic.com/claude/pricing | 2025-05-21 |
| Enterprise | Custom | https://anthropic.com/claude/pricing | 2025-05-21 |

**Notes:**
- Max (5×): 5× usage vs Pro — justified for heavy interactive users
- Max (20×): 20× usage vs Pro — designed for agentic/overnight workflows
- Team: includes shared Projects, admin console, centralized billing
- Team minimum is 5 seats — below this, individual Pro plans are cheaper
- Audit rule: Max (20×) is almost never justified for interactive users; Max (5×) requires consistent Pro limit exhaustion to justify

---

## ChatGPT (OpenAI)

| Plan | Price | Source | Verified |
|------|-------|--------|----------|
| Free | $0 | https://openai.com/chatgpt/pricing | 2025-05-21 |
| Plus | $20/month (individual) | https://openai.com/chatgpt/pricing | 2025-05-21 |
| Team | $30/user/month (min 2 seats) | https://openai.com/chatgpt/pricing | 2025-05-21 |
| Enterprise | Custom | https://openai.com/chatgpt/pricing | 2025-05-21 |

**Notes:**
- Plus: GPT-4o, DALL·E, advanced voice, web browsing, 5× message limits vs Free
- Team adds: shared workspace, admin console, no training on prompts, longer context
- Audit rule: Team at ≤3 seats is $10/seat/mo premium for shared workspace features typically not used at that size

---

## Anthropic API (Direct)

| Model | Input | Output | Source | Verified |
|-------|-------|--------|--------|----------|
| Claude 3.5 Haiku | $0.80/MTok | $4/MTok | https://anthropic.com/api | 2025-05-21 |
| Claude 3.5 Sonnet | $3/MTok | $15/MTok | https://anthropic.com/api | 2025-05-21 |
| Claude 3 Opus | $15/MTok | $75/MTok | https://anthropic.com/api | 2025-05-21 |

**Notes:**
- Pay-as-you-go. No subscription fee.
- Audit rule: If API spend <$30/mo and user has Claude Pro, consolidation to Pro may be cheaper for non-programmatic usage

---

## OpenAI API (Direct)

| Model | Input | Output | Source | Verified |
|-------|-------|--------|--------|----------|
| GPT-4o | $2.50/MTok | $10/MTok | https://openai.com/api/pricing | 2025-05-21 |
| GPT-4o mini | $0.15/MTok | $0.60/MTok | https://openai.com/api/pricing | 2025-05-21 |
| GPT-4 Turbo | $10/MTok | $30/MTok | https://openai.com/api/pricing | 2025-05-21 |

**Notes:**
- Pay-as-you-go. Batch API available at 50% discount.
- Audit rule: API usage <$25/mo with ChatGPT Plus subscription → consolidate into Plus

---

## Gemini (Google)

| Plan | Price | Source | Verified |
|------|-------|--------|----------|
| Free | $0 | https://gemini.google.com | 2025-05-21 |
| Advanced (Google One AI Premium) | $19.99/month | https://one.google.com/about/ai-premium | 2025-05-21 |
| Workspace Business Starter + Gemini | $14-$30/user/month | https://workspace.google.com/pricing | 2025-05-21 |

**Notes:**
- Advanced bundles 2TB Google Drive storage + Gemini 1.5 Pro access + NotebookLM Plus
- Workspace pricing varies by tier; Gemini add-on pricing applies on top of base Workspace
- Audit rule: Gemini Workspace for coding use cases is a mismatch — redirect to Cursor/Claude

---

## Windsurf (Codeium)

| Plan | Price | Source | Verified |
|------|-------|--------|----------|
| Free | $0 | https://codeium.com/windsurf/pricing | 2025-05-21 |
| Pro | $15/user/month | https://codeium.com/windsurf/pricing | 2025-05-21 |
| Teams | $35/user/month | https://codeium.com/windsurf/pricing | 2025-05-21 |

**Notes:**
- Free: limited AI flows/month
- Pro: unlimited fast completions, 10 premium AI flows/day
- Teams adds: admin console, SSO, priority support, team usage analytics
- Audit rule: Windsurf + Cursor simultaneously = redundancy → eliminate one
