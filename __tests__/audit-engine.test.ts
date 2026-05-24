import { runAudit, type AuditInput } from '../lib/audit-engine'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeInput(overrides: Partial<AuditInput> = {}): AuditInput {
  return {
    tools: [],
    teamSize: 3,
    useCase: 'coding',
    ...overrides,
  }
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('Audit Engine — Core Logic', () => {
  // Test 1
  test('flags ChatGPT Team for ≤3 users as oversized', () => {
    const input = makeInput({
      tools: [
        {
          toolId: 'chatgpt',
          planId: 'team',
          seats: 2,
          monthlySpend: 60,
        },
      ],
      teamSize: 2,
    })
    const result = runAudit(input)
    const rec = result.recommendations.find((r) => r.toolId === 'chatgpt')
    expect(rec).toBeDefined()
    expect(rec!.monthlySavings).toBeGreaterThan(0)
    expect(rec!.severity).toBe('warning')
    expect(rec!.recommendedAction).toMatch(/downgrade/i)
  })

  // Test 2
  test('detects Cursor + GitHub Copilot redundancy and flags Copilot as critical', () => {
    const input = makeInput({
      tools: [
        { toolId: 'cursor', planId: 'pro', seats: 3, monthlySpend: 60 },
        { toolId: 'github_copilot', planId: 'individual', seats: 3, monthlySpend: 30 },
      ],
    })
    const result = runAudit(input)
    const copilotRec = result.recommendations.find((r) => r.toolId === 'github_copilot')
    expect(copilotRec).toBeDefined()
    expect(copilotRec!.severity).toBe('critical')
    expect(copilotRec!.monthlySavings).toBe(30)
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(30)
  })

  // Test 3
  test('recommends downgrade from Claude Max (5x) to Pro for single user', () => {
    const input = makeInput({
      tools: [
        { toolId: 'claude', planId: 'max_5x', seats: 1, monthlySpend: 100 },
      ],
      teamSize: 1,
    })
    const result = runAudit(input)
    const rec = result.recommendations.find((r) => r.toolId === 'claude')
    expect(rec).toBeDefined()
    expect(rec!.severity).toBe('warning')
    expect(rec!.monthlySavings).toBe(80) // $100 - $20
    expect(rec!.recommendedPlanLabel).toMatch(/Pro/i)
  })

  // Test 4
  test('calculates annual savings correctly as 12x monthly savings', () => {
    const input = makeInput({
      tools: [
        { toolId: 'cursor', planId: 'business', seats: 3, monthlySpend: 120 },
      ],
    })
    const result = runAudit(input)
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12)
  })

  // Test 5
  test('returns no savings (isAlreadyOptimal=true) for already-optimal Cursor Pro', () => {
    const input = makeInput({
      tools: [
        { toolId: 'cursor', planId: 'pro', seats: 2, monthlySpend: 40 },
      ],
    })
    const result = runAudit(input)
    const rec = result.recommendations.find((r) => r.toolId === 'cursor')
    expect(rec?.severity).toBe('ok')
    expect(rec?.monthlySavings).toBe(0)
    expect(result.isAlreadyOptimal).toBe(true)
    expect(result.totalMonthlySavings).toBe(0)
  })

  // Test 6
  test('handles empty tool list without crashing', () => {
    const input = makeInput({ tools: [] })
    expect(() => runAudit(input)).not.toThrow()
    const result = runAudit(input)
    expect(result.recommendations).toHaveLength(0)
    expect(result.totalMonthlySavings).toBe(0)
    expect(result.isAlreadyOptimal).toBe(true)
  })

  // Test 7
  test('flags Windsurf as redundant when Cursor Pro is present', () => {
    const input = makeInput({
      tools: [
        { toolId: 'cursor', planId: 'pro', seats: 2, monthlySpend: 40 },
        { toolId: 'windsurf', planId: 'pro', seats: 2, monthlySpend: 30 },
      ],
    })
    const result = runAudit(input)
    const windsurfRec = result.recommendations.find((r) => r.toolId === 'windsurf')
    expect(windsurfRec).toBeDefined()
    expect(windsurfRec!.severity).toBe('critical')
    expect(windsurfRec!.monthlySavings).toBe(30)
  })

  // Test 8
  test('flags Claude Team with fewer than 5 seats as incorrectly sized', () => {
    const input = makeInput({
      tools: [
        { toolId: 'claude', planId: 'team', seats: 3, monthlySpend: 90 },
      ],
      teamSize: 3,
    })
    const result = runAudit(input)
    const rec = result.recommendations.find((r) => r.toolId === 'claude')
    expect(rec).toBeDefined()
    expect(rec!.monthlySavings).toBe(30) // 3 × ($30 - $20)
    expect(rec!.severity).toBe('critical')
  })

  // Test 9
  test('highSavings is true when totalMonthlySavings > 500', () => {
    const input = makeInput({
      tools: [
        { toolId: 'cursor', planId: 'business', seats: 20, monthlySpend: 800 },
        { toolId: 'github_copilot', planId: 'business', seats: 20, monthlySpend: 380 },
      ],
    })
    const result = runAudit(input)
    if (result.totalMonthlySavings > 500) {
      expect(result.highSavings).toBe(true)
    }
  })

  // Test 10
  test('totalCurrentSpend matches sum of individual tool spend', () => {
    const tools = [
      { toolId: 'cursor' as const, planId: 'pro', seats: 3, monthlySpend: 60 },
      { toolId: 'chatgpt' as const, planId: 'plus', seats: 3, monthlySpend: 60 },
      { toolId: 'claude' as const, planId: 'pro', seats: 1, monthlySpend: 20 },
    ]
    const input = makeInput({ tools })
    const result = runAudit(input)
    const expectedTotal = tools.reduce((sum, t) => sum + t.monthlySpend, 0)
    expect(result.totalCurrentSpend).toBe(expectedTotal)
  })

  // Test 11
  test('recommendations sorted: critical before warning before info before ok', () => {
    const input = makeInput({
      tools: [
        { toolId: 'cursor', planId: 'pro', seats: 2, monthlySpend: 40 }, // ok
        { toolId: 'claude', planId: 'max_5x', seats: 1, monthlySpend: 100 }, // warning
        { toolId: 'windsurf', planId: 'pro', seats: 2, monthlySpend: 30 }, // critical (redundant with cursor)
      ],
    })
    const result = runAudit(input)
    const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2, ok: 3 }
    for (let i = 1; i < result.recommendations.length; i++) {
      const prev = severityOrder[result.recommendations[i - 1].severity]
      const curr = severityOrder[result.recommendations[i].severity]
      expect(prev).toBeLessThanOrEqual(curr)
    }
  })

  // Test 12
  test('fallback summary is a non-empty string', () => {
    const input = makeInput({
      tools: [
        { toolId: 'cursor', planId: 'business', seats: 5, monthlySpend: 200 },
      ],
    })
    const result = runAudit(input)
    expect(result.summary).toBeTruthy()
    expect(typeof result.summary).toBe('string')
    expect(result.summary.length).toBeGreaterThan(20)
  })
})
