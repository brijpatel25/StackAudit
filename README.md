# StackAudit

**Audit your AI tool spend in 2 minutes. Find exactly where you're overpaying, what to cut, and how much to save.**

Built for engineering managers and CTOs at 5–50 person teams who are paying for Cursor, Claude, ChatGPT, GitHub Copilot, and friends — and aren't sure if they're on the right plans.

🔗 **Live:** https://stackaudit.vercel.app

---

## Screenshots

![Landing page — step 1 tool selection](docs/screenshot-form.png)
![Results page — savings hero and per-tool breakdown](docs/screenshot-results.png)
![Results page — email gate and share URL](docs/screenshot-share.png)

*(Screenshots available in `/docs/` after first deploy)*

---

## Quick Start

### Prerequisites
- Node.js 20+
- A Supabase project (free tier works)
- Anthropic API key (optional — audit works without it, AI summary falls back to template)
- Resend API key (optional — email confirmation)

### Local setup

```bash
git clone https://github.com/your-username/stackaudit
cd stackaudit
npm install
cp .env.example .env.local
# Fill in your keys (see below)
npm run dev
```

Open http://localhost:3000

### Environment variables

```env
# Required for persistence (get from supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Optional — AI summary generation (falls back to template if absent)
ANTHROPIC_API_KEY=sk-ant-xxx

# Optional — confirmation emails
RESEND_API_KEY=re_xxx
```

### Supabase schema

Run in Supabase SQL editor:

```sql
create table audits (
  id text primary key,
  tools jsonb not null,
  team_size integer not null,
  use_case text not null,
  total_monthly_savings numeric not null,
  total_annual_savings numeric not null,
  total_current_spend numeric not null,
  recommendations jsonb not null,
  ai_summary text,
  created_at timestamptz default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  audit_id text references audits(id),
  email text not null,
  company_name text,
  role text,
  team_size integer,
  created_at timestamptz default now()
);

-- Public read for audit pages (strips PII — leads table is private)
alter table audits enable row level security;
create policy "Public read audits" on audits for select using (true);
create policy "Service insert audits" on audits for insert with check (true);

alter table leads enable row level security;
create policy "Service insert leads" on leads for insert with check (true);
-- No public read on leads — email data stays private
```

### Deploy to Vercel

```bash
npx vercel
# Add environment variables in Vercel dashboard
```

### Run tests

```bash
npm test
```

---

## Decisions

Five key trade-offs made during the build:

**1. Hardcoded audit rules vs AI for recommendations**
The audit math is 100% TypeScript rules — zero AI involvement. AI is only used for the ~100-word summary paragraph. Reason: financial recommendations need to be auditable, consistent, and explainable. "Because the model said so" fails a finance review. The hardcoded rules trace directly to `PRICING_DATA.md` which traces to official vendor URLs. This also means the audit works with no API key.

**2. No-login architecture — full commitment**
Some tools ask for email upfront "to save your results." We don't. Email is asked after results are shown, and is explicitly optional. This costs us some leads but is a product-integrity choice: the audit is genuinely useful before any email is shared. HN and Twitter audiences are particularly sensitive to this pattern and reward tools that respect it.

**3. Supabase over a simpler key-value store**
Could have used Vercel KV or plain JSON files. Chose Supabase because: real SQL querying for future analytics, row-level security for keeping lead emails private while audits are public, and it scales to millions of rows without rearchitecting. The free tier handles the MVP easily.

**4. Editorial design vs standard SaaS aesthetic**
Deliberately avoided the "purple gradient SaaS" look. Chose a financial-document aesthetic (serif headlines, mono data labels, paper/cream/ink palette) because the target user is finance-aware and we're asking them to trust numbers. A tool that looks like a CFO report is more credible than one that looks like a startup landing page. User interview feedback directly validated this: "I'd forward this to our CFO."

**5. In-memory rate limiting vs Upstash Redis**
In-memory means rate limits reset on deploy and don't persist across serverless function instances. Acceptable for MVP: each function instance independently limits, so the effective limit is higher than intended but still protective. Upstash Redis ($0/10k requests) is the right week-2 upgrade once traffic warrants it.

## Deployment
Live at https://stackaudit-omega.vercel.app
