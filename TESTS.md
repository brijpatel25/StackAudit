# TESTS.md

## Automated Tests

All tests are in `__tests__/audit-engine.test.ts`.

### How to run

```bash
npm test
# or
npm run test:ci    # CI mode, no watch
```

### Test list

| # | File | Test name | What it covers |
|---|------|-----------|----------------|
| 1 | `audit-engine.test.ts` | flags ChatGPT Team for ≤3 users as oversized | ChatGPT Team → Plus downgrade rule; verifies savings > 0 and severity = warning |
| 2 | `audit-engine.test.ts` | detects Cursor + GitHub Copilot redundancy | Cross-tool redundancy detection; Copilot flagged as critical when Cursor Pro present |
| 3 | `audit-engine.test.ts` | recommends downgrade from Claude Max (5x) to Pro | Claude Max → Pro rule; verifies $80 savings and correct recommended plan label |
| 4 | `audit-engine.test.ts` | calculates annual savings correctly as 12x monthly | Math correctness: totalAnnualSavings === totalMonthlySavings × 12 |
| 5 | `audit-engine.test.ts` | returns no savings for already-optimal Cursor Pro | No false positives: Cursor Pro 2 seats should be severity 'ok', savings = 0 |
| 6 | `audit-engine.test.ts` | handles empty tool list without crashing | Edge case: empty array input; no throw, empty recommendations, isAlreadyOptimal = true |
| 7 | `audit-engine.test.ts` | flags Windsurf as redundant when Cursor Pro is present | Windsurf redundancy rule; critical severity, full Windsurf cost as savings |
| 8 | `audit-engine.test.ts` | flags Claude Team with fewer than 5 seats | Claude Team minimum seats rule; critical severity, correct per-seat savings |
| 9 | `audit-engine.test.ts` | highSavings is true when totalMonthlySavings > 500 | Credex CTA threshold: highSavings flag set correctly |
| 10 | `audit-engine.test.ts` | totalCurrentSpend matches sum of individual tool spend | Spend aggregation math; no spend lost or double-counted |
| 11 | `audit-engine.test.ts` | recommendations sorted: critical before warning before info before ok | Sort order: ensures most impactful items appear first in UI |
| 12 | `audit-engine.test.ts` | fallback summary is a non-empty string | Summary generation: non-empty string returned even without API |

### Coverage target

The audit engine (`lib/audit-engine.ts`) is the most critical file. Tests 1–12 cover:
- All major per-tool audit functions
- Cross-tool redundancy detection
- Severity assignment
- Sort order
- Math calculations
- Edge cases (empty input)
- Output shape validation

### Running with coverage

```bash
npx jest --coverage --collectCoverageFrom="lib/audit-engine.ts"
```
