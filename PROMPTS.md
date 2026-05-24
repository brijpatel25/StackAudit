# PROMPTS.md

Full LLM prompts used in StackAudit, with rationale.

---

## 1. Audit Summary Generator

Used in: `/app/api/audit/route.ts` → `generateAISummary()`

### Final Prompt

```
You are a concise financial advisor specializing in SaaS spend optimization. Generate a 90-100 word personalized summary for this AI tool audit.

Tools: {toolList}
Team size: {teamSize}
Primary use case: {useCase}
Total monthly spend: ${totalCurrentSpend}
Potential monthly savings: ${totalMonthlySavings}
Potential annual savings: ${totalAnnualSavings}
Already optimal: {isAlreadyOptimal}

Write a single paragraph (no bullets, no headers). Be specific to their exact stack. Mention 1-2 key actionable recommendations. Tone: CFO-level directness, not cheerleader. Start directly with their situation — no "Based on your audit" filler. Do not exceed 100 words.
```

### Why written this way

**"CFO-level directness, not cheerleader"** — Initial tests without this produced summaries like "Great news! You have exciting optimization opportunities!" which felt hollow. The CFO framing produces copy like "Your $340/mo coding stack has meaningful redundancy..." which matches the editorial tone of the results page.

**"No 'Based on your audit' filler"** — Every naive generation started with this phrase. Explicit prohibition fixed it.

**Word limit enforcement** — "Do not exceed 100 words" was more reliable than "approximately 100 words" in testing. Still occasionally produces 105-word responses; we display them as-is.

**Structured input format** — Early versions passed the full tool list as prose ("user pays for Cursor Pro at $60/month..."). Structured format with labels reduced hallucination of specific numbers.

### What didn't work

**Version 1: "Write a paragraph about their AI spend"**
Too vague. Output was generic "AI tools are increasingly important for modern teams..." boilerplate.

**Version 2: Asking for recommendations in bullet points**
Conflicted with the editorial design (prose paragraph in a dark box). Reverted to paragraph format.

**Version 3: Using the same prompt for both savings and no-savings cases**
No-savings summaries read as disappointing ("Unfortunately, we couldn't find savings..."). Added `Already optimal: true/false` flag so the model can celebrate the no-savings case appropriately.

**Version 4: Asking for exactly 100 words**
Claude would add padding words to hit the count, degrading quality. "Do not exceed 100 words" produced tighter copy.

---

## 2. Design Decision: AI vs Hardcoded Rules

The spec explicitly tests "knowing when not to use AI." 

The audit engine (`/lib/audit-engine.ts`) is **100% hardcoded TypeScript rules**. This was the correct choice because:

1. **Auditability** — A finance person can read the code and verify every recommendation traces to real pricing data
2. **Consistency** — The same inputs always produce the same outputs. An LLM would produce variance in savings calculations.
3. **Speed** — No API latency on the audit itself; only the summary generation uses the API
4. **Cost** — Calling Claude for every audit would add ~$0.003/audit in API costs; hardcoded rules are free
5. **Failure modes** — If the Anthropic API fails, the audit still runs perfectly. The AI summary falls back to a templated string.

AI is only used where it genuinely adds value: synthesizing a personalized natural-language summary that reads better than a template and mentions the user's specific situation. The math itself — the numbers people act on — is never AI-generated.
