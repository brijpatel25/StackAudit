import { TOOL_CONFIGS, getPlan, type ToolId, type UseCaseId } from './pricing-data'

export interface ToolInput {
  toolId: ToolId
  planId: string
  seats: number
  monthlySpend: number // user-entered (may differ from calculated)
}

export interface AuditInput {
  tools: ToolInput[]
  teamSize: number
  useCase: UseCaseId
}

export type SeverityLevel = 'critical' | 'warning' | 'info' | 'ok'

export interface ToolRecommendation {
  toolId: ToolId
  toolLabel: string
  currentPlanLabel: string
  currentMonthlyCost: number
  recommendedAction: string
  recommendedPlanLabel?: string
  estimatedMonthlyCost: number
  monthlySavings: number
  annualSavings: number
  reason: string
  severity: SeverityLevel
}

export interface AuditResult {
  recommendations: ToolRecommendation[]
  totalMonthlySavings: number
  totalAnnualSavings: number
  totalCurrentSpend: number
  totalOptimizedSpend: number
  isAlreadyOptimal: boolean
  highSavings: boolean // >$500/mo
  summary: string // templated fallback
}

// ─── Audit Rules ──────────────────────────────────────────────────────────────

function auditCursor(input: ToolInput, teamSize: number): ToolRecommendation {
  const config = TOOL_CONFIGS.cursor
  const plan = getPlan('cursor', input.planId)
  const toolLabel = config.label
  const currentLabel = plan?.label ?? input.planId
  const current = input.monthlySpend

  // Business plan only justified for SSO/privacy mode needs or >10 seats
  if (input.planId === 'business' && input.seats <= 5) {
    const downgradeMonthly = 20 * input.seats
    return {
      toolId: 'cursor',
      toolLabel,
      currentPlanLabel: currentLabel,
      currentMonthlyCost: current,
      recommendedAction: 'Downgrade to Pro',
      recommendedPlanLabel: 'Pro',
      estimatedMonthlyCost: downgradeMonthly,
      monthlySavings: current - downgradeMonthly,
      annualSavings: (current - downgradeMonthly) * 12,
      reason: `Business plan costs $40/seat vs Pro at $20/seat. The premium covers SSO and centralized policy — unnecessary for teams under ~10 unless your org mandates SSO. At ${input.seats} seats, that's $${current - downgradeMonthly}/mo for features you likely don't need.`,
      severity: 'warning',
    }
  }

  if (input.planId === 'pro' && input.seats >= 1) {
    return {
      toolId: 'cursor',
      toolLabel,
      currentPlanLabel: currentLabel,
      currentMonthlyCost: current,
      recommendedAction: 'Keep current plan',
      estimatedMonthlyCost: current,
      monthlySavings: 0,
      annualSavings: 0,
      reason: `Cursor Pro at $20/seat is the right tier for individual developers who need fast completions and GPT-4 access. No changes recommended.`,
      severity: 'ok',
    }
  }

  return {
    toolId: 'cursor',
    toolLabel,
    currentPlanLabel: currentLabel,
    currentMonthlyCost: current,
    recommendedAction: 'Keep current plan',
    estimatedMonthlyCost: current,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `Current plan is appropriate for your usage.`,
    severity: 'ok',
  }
}

function auditCopilot(input: ToolInput, useCase: UseCaseId): ToolRecommendation {
  const config = TOOL_CONFIGS.github_copilot
  const plan = getPlan('github_copilot', input.planId)
  const toolLabel = config.label
  const currentLabel = plan?.label ?? input.planId
  const current = input.monthlySpend

  if (input.planId === 'enterprise' && input.seats <= 10) {
    const downgradeMonthly = 19 * input.seats
    return {
      toolId: 'github_copilot',
      toolLabel,
      currentPlanLabel: currentLabel,
      currentMonthlyCost: current,
      recommendedAction: 'Downgrade to Business',
      recommendedPlanLabel: 'Business',
      estimatedMonthlyCost: downgradeMonthly,
      monthlySavings: current - downgradeMonthly,
      annualSavings: (current - downgradeMonthly) * 12,
      reason: `Enterprise adds fine-tuning and knowledge bases — valuable for teams >50 with established codebases. At ${input.seats} seats, you're paying $${39 - 19}/seat/mo for features that likely aren't in use. Business covers policy management and IP indemnity which are the real enterprise needs.`,
      severity: 'warning',
    }
  }

  if (input.planId === 'business' && input.seats <= 3) {
    const downgradeMonthly = 10 * input.seats
    return {
      toolId: 'github_copilot',
      toolLabel,
      currentPlanLabel: currentLabel,
      currentMonthlyCost: current,
      recommendedAction: 'Downgrade to Individual',
      recommendedPlanLabel: 'Individual',
      estimatedMonthlyCost: downgradeMonthly,
      monthlySavings: current - downgradeMonthly,
      annualSavings: (current - downgradeMonthly) * 12,
      reason: `Business plan adds policy management and audit logs — features that matter at 10+ seats. At ${input.seats} users, Individual plans give identical completion quality at nearly half the cost. Switch when you need centralized seat management.`,
      severity: 'info',
    }
  }

  return {
    toolId: 'github_copilot',
    toolLabel,
    currentPlanLabel: currentLabel,
    currentMonthlyCost: current,
    recommendedAction: 'Keep current plan',
    estimatedMonthlyCost: current,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `GitHub Copilot ${plan?.label} is well-matched to your team size and use case.`,
    severity: 'ok',
  }
}

function auditClaude(input: ToolInput, teamSize: number, useCase: UseCaseId): ToolRecommendation {
  const config = TOOL_CONFIGS.claude
  const plan = getPlan('claude', input.planId)
  const toolLabel = config.label
  const currentLabel = plan?.label ?? input.planId
  const current = input.monthlySpend

  // Max plans are overkill unless hitting Pro limits constantly
  if (input.planId === 'max_20x') {
    const downgradeMonthly = 100 * input.seats
    return {
      toolId: 'claude',
      toolLabel,
      currentPlanLabel: 'Max (20×)',
      currentMonthlyCost: current,
      recommendedAction: 'Downgrade to Max (5×)',
      recommendedPlanLabel: 'Max (5×)',
      estimatedMonthlyCost: downgradeMonthly,
      monthlySavings: current - downgradeMonthly,
      annualSavings: (current - downgradeMonthly) * 12,
      reason: `Max (20×) is designed for users who hit Max (5×) limits regularly — essentially agentic workflows running all day. Unless you're running overnight autonomous pipelines, Max (5×) at $100/mo provides 5× Pro usage which covers even heavy interactive use.`,
      severity: 'critical',
    }
  }

  if (input.planId === 'max_5x') {
    return {
      toolId: 'claude',
      toolLabel,
      currentPlanLabel: 'Max (5×)',
      currentMonthlyCost: current,
      recommendedAction: 'Evaluate against Pro usage',
      recommendedPlanLabel: 'Pro',
      estimatedMonthlyCost: 20 * input.seats,
      monthlySavings: current - 20 * input.seats,
      annualSavings: (current - 20 * input.seats) * 12,
      reason: `Max (5×) at $100/mo is only justified if you regularly exhaust Claude Pro's daily limits. Most users — even heavy ones writing thousands of words daily — fit comfortably within Pro. Downgrade to Pro ($20/mo), monitor for 2 weeks; upgrade only if you hit rate limits.`,
      severity: 'warning',
    }
  }

  // Team plan with few seats
  if (input.planId === 'team' && input.seats < 5) {
    return {
      toolId: 'claude',
      toolLabel,
      currentPlanLabel: currentLabel,
      currentMonthlyCost: current,
      recommendedAction: 'Switch to individual Pro plans',
      recommendedPlanLabel: 'Pro (individual)',
      estimatedMonthlyCost: 20 * input.seats,
      monthlySavings: current - 20 * input.seats,
      annualSavings: (current - 20 * input.seats) * 12,
      reason: `Claude Team requires a minimum of 5 seats ($30/seat). With ${input.seats} users, individual Pro plans at $20/seat are $${30 - 20}/seat/mo cheaper. Team adds shared workspaces and admin console — useful at 10+ but overhead at ${input.seats}.`,
      severity: input.seats < 5 ? 'critical' : 'warning',
    }
  }

  return {
    toolId: 'claude',
    toolLabel,
    currentPlanLabel: currentLabel,
    currentMonthlyCost: current,
    recommendedAction: 'Keep current plan',
    estimatedMonthlyCost: current,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `Claude ${plan?.label} is appropriately matched to your team's needs.`,
    severity: 'ok',
  }
}

function auditChatGPT(input: ToolInput, teamSize: number): ToolRecommendation {
  const config = TOOL_CONFIGS.chatgpt
  const plan = getPlan('chatgpt', input.planId)
  const toolLabel = config.label
  const currentLabel = plan?.label ?? input.planId
  const current = input.monthlySpend

  // Team plan for ≤3 users is overkill
  if (input.planId === 'team' && input.seats <= 3) {
    const downgradeMonthly = 20 * input.seats
    return {
      toolId: 'chatgpt',
      toolLabel,
      currentPlanLabel: currentLabel,
      currentMonthlyCost: current,
      recommendedAction: 'Downgrade to Plus (individual)',
      recommendedPlanLabel: 'Plus',
      estimatedMonthlyCost: downgradeMonthly,
      monthlySavings: current - downgradeMonthly,
      annualSavings: (current - downgradeMonthly) * 12,
      reason: `ChatGPT Team ($30/seat) adds shared workspace and admin controls — features that matter at 5+ people. With ${input.seats} users, individual Plus plans at $20/seat give identical model access at $${current - downgradeMonthly}/mo less. Team's no-training-data guarantee can be replicated with individual accounts via settings.`,
      severity: 'warning',
    }
  }

  return {
    toolId: 'chatgpt',
    toolLabel,
    currentPlanLabel: currentLabel,
    currentMonthlyCost: current,
    recommendedAction: 'Keep current plan',
    estimatedMonthlyCost: current,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `ChatGPT ${plan?.label} is well-suited for your current usage.`,
    severity: 'ok',
  }
}

function auditGemini(input: ToolInput, useCase: UseCaseId): ToolRecommendation {
  const plan = getPlan('gemini', input.planId)
  const current = input.monthlySpend

  if (input.planId === 'workspace' && useCase === 'coding') {
    const altMonthly = input.seats * 20
    return {
      toolId: 'gemini',
      toolLabel: 'Gemini',
      currentPlanLabel: plan?.label ?? input.planId,
      currentMonthlyCost: current,
      recommendedAction: 'Switch to Cursor or Claude Pro for coding',
      estimatedMonthlyCost: altMonthly,
      monthlySavings: current - altMonthly > 0 ? current - altMonthly : 0,
      annualSavings: (current - altMonthly > 0 ? current - altMonthly : 0) * 12,
      reason: `Gemini for Workspace is optimized for Google ecosystem productivity (Docs, Sheets, Gmail), not coding. For coding use cases, Cursor Pro or Claude Pro offer dramatically better code completion, context awareness, and IDE integration at similar or lower cost.`,
      severity: 'info',
    }
  }

  return {
    toolId: 'gemini',
    toolLabel: 'Gemini',
    currentPlanLabel: plan?.label ?? input.planId,
    currentMonthlyCost: current,
    recommendedAction: 'Keep current plan',
    estimatedMonthlyCost: current,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `Gemini ${plan?.label} is appropriate for your use case.`,
    severity: 'ok',
  }
}

function auditWindsurf(input: ToolInput, allTools: ToolInput[]): ToolRecommendation {
  const plan = getPlan('windsurf', input.planId)
  const current = input.monthlySpend

  // Check for redundancy with Cursor
  const hasCursor = allTools.some(
    (t) => t.toolId === 'cursor' && ['pro', 'business'].includes(t.planId)
  )

  if (hasCursor) {
    return {
      toolId: 'windsurf',
      toolLabel: 'Windsurf',
      currentPlanLabel: plan?.label ?? input.planId,
      currentMonthlyCost: current,
      recommendedAction: 'Cancel — redundant with Cursor',
      estimatedMonthlyCost: 0,
      monthlySavings: current,
      annualSavings: current * 12,
      reason: `You're paying for both Cursor and Windsurf — two AI coding editors with substantially overlapping capabilities (code completions, chat, multi-file edits). Pick one. Cursor has a larger model ecosystem and broader language support; Windsurf has a cleaner UX. Running both means half your coding AI spend is wasted.`,
      severity: 'critical',
    }
  }

  return {
    toolId: 'windsurf',
    toolLabel: 'Windsurf',
    currentPlanLabel: plan?.label ?? input.planId,
    currentMonthlyCost: current,
    recommendedAction: 'Keep current plan',
    estimatedMonthlyCost: current,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `Windsurf ${plan?.label} is a solid choice for AI-assisted coding at this price point.`,
    severity: 'ok',
  }
}

function auditCopilotVsCursor(tools: ToolInput[]): ToolRecommendation | null {
  const cursor = tools.find(
    (t) => t.toolId === 'cursor' && ['pro', 'business'].includes(t.planId)
  )
  const copilot = tools.find(
    (t) => t.toolId === 'github_copilot' && t.seats > 0
  )

  if (!cursor || !copilot) return null

  const copilotMonthly = copilot.monthlySpend

  return {
    toolId: 'github_copilot',
    toolLabel: 'GitHub Copilot',
    currentPlanLabel: 'Redundant with Cursor',
    currentMonthlyCost: copilotMonthly,
    recommendedAction: 'Cancel GitHub Copilot — Cursor covers this',
    estimatedMonthlyCost: 0,
    monthlySavings: copilotMonthly,
    annualSavings: copilotMonthly * 12,
    reason: `You're paying for Cursor and GitHub Copilot simultaneously. Cursor is a full IDE replacement with native code completions — it renders Copilot's core value redundant. At ${copilot.seats} seat(s), canceling Copilot saves $${copilotMonthly}/mo with zero loss in capability.`,
    severity: 'critical',
  }
}

function auditAnthropicApi(input: ToolInput, allTools: ToolInput[]): ToolRecommendation {
  const current = input.monthlySpend
  const hasClaude = allTools.some((t) => t.toolId === 'claude' && t.planId !== 'free')

  if (hasClaude && current < 30) {
    return {
      toolId: 'anthropic_api',
      toolLabel: 'Anthropic API',
      currentPlanLabel: 'Pay-as-you-go',
      currentMonthlyCost: current,
      recommendedAction: 'Consider consolidating to Claude Pro',
      recommendedPlanLabel: 'Claude Pro',
      estimatedMonthlyCost: 20,
      monthlySavings: current > 20 ? current - 20 : 0,
      annualSavings: current > 20 ? (current - 20) * 12 : 0,
      reason: `You're paying for both Claude.ai and Anthropic API. If your API usage is primarily for personal/interactive tasks (under $30/mo), Claude Pro at $20/mo flat covers the same models with higher rate limits via the web interface. Keep API access only if you have programmatic workflows.`,
      severity: 'info',
    }
  }

  return {
    toolId: 'anthropic_api',
    toolLabel: 'Anthropic API',
    currentPlanLabel: 'Pay-as-you-go',
    currentMonthlyCost: current,
    recommendedAction: 'Keep — appropriate for programmatic use',
    estimatedMonthlyCost: current,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `API access at $${current}/mo is the right model for programmatic workflows. Pay-as-you-go pricing scales cleanly with usage.`,
    severity: 'ok',
  }
}

function auditOpenAiApi(input: ToolInput, allTools: ToolInput[]): ToolRecommendation {
  const current = input.monthlySpend
  const hasChatGPT = allTools.some((t) => t.toolId === 'chatgpt' && t.planId !== 'free')

  if (hasChatGPT && current < 25) {
    return {
      toolId: 'openai_api',
      toolLabel: 'OpenAI API',
      currentPlanLabel: 'Pay-as-you-go',
      currentMonthlyCost: current,
      recommendedAction: 'Consolidate into ChatGPT Plus',
      recommendedPlanLabel: 'ChatGPT Plus',
      estimatedMonthlyCost: 0,
      monthlySavings: current,
      annualSavings: current * 12,
      reason: `Your OpenAI API spend is under $25/mo — likely covering exploratory usage rather than production workflows. ChatGPT Plus ($20/mo) includes the same GPT-4o model access via UI without metered API costs. If no code depends on the API, consolidate.`,
      severity: 'info',
    }
  }

  return {
    toolId: 'openai_api',
    toolLabel: 'OpenAI API',
    currentPlanLabel: 'Pay-as-you-go',
    currentMonthlyCost: current,
    recommendedAction: 'Keep — justified for programmatic workflows',
    estimatedMonthlyCost: current,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `API usage at $${current}/mo reflects genuine programmatic needs. No optimization recommended.`,
    severity: 'ok',
  }
}

// ─── Main Audit Function ───────────────────────────────────────────────────────

export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, useCase } = input
  const recommendations: ToolRecommendation[] = []

  for (const tool of tools) {
    if (tool.monthlySpend === 0 && tool.planId === 'free') continue

    switch (tool.toolId) {
      case 'cursor':
        recommendations.push(auditCursor(tool, teamSize))
        break
      case 'github_copilot':
        // Check Cursor redundancy first (handled separately below)
        recommendations.push(auditCopilot(tool, useCase))
        break
      case 'claude':
        recommendations.push(auditClaude(tool, teamSize, useCase))
        break
      case 'chatgpt':
        recommendations.push(auditChatGPT(tool, teamSize))
        break
      case 'gemini':
        recommendations.push(auditGemini(tool, useCase))
        break
      case 'windsurf':
        recommendations.push(auditWindsurf(tool, tools))
        break
      case 'anthropic_api':
        recommendations.push(auditAnthropicApi(tool, tools))
        break
      case 'openai_api':
        recommendations.push(auditOpenAiApi(tool, tools))
        break
    }
  }

  // Cross-tool redundancy: Cursor + Copilot
  const copilotVsCursorRec = auditCopilotVsCursor(tools)
  if (copilotVsCursorRec) {
    // Replace the existing copilot recommendation with the more specific one
    const idx = recommendations.findIndex((r) => r.toolId === 'github_copilot')
    if (idx >= 0) recommendations[idx] = copilotVsCursorRec
    else recommendations.push(copilotVsCursorRec)
  }

  const totalCurrentSpend = tools.reduce((sum, t) => sum + t.monthlySpend, 0)
  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.monthlySavings,
    0
  )
  const totalOptimizedSpend = totalCurrentSpend - totalMonthlySavings

  const isAlreadyOptimal = totalMonthlySavings === 0
  const highSavings = totalMonthlySavings > 500

  // Sort: critical first, then warning, info, ok
  const severityOrder: Record<SeverityLevel, number> = {
    critical: 0,
    warning: 1,
    info: 2,
    ok: 3,
  }
  recommendations.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  )

  const summary = buildFallbackSummary(
    recommendations,
    totalCurrentSpend,
    totalMonthlySavings,
    useCase,
    teamSize
  )

  return {
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    totalCurrentSpend,
    totalOptimizedSpend,
    isAlreadyOptimal,
    highSavings,
    summary,
  }
}

function buildFallbackSummary(
  recs: ToolRecommendation[],
  currentSpend: number,
  monthlySavings: number,
  useCase: UseCaseId,
  teamSize: number
): string {
  if (monthlySavings === 0) {
    return `Your AI stack of $${currentSpend}/mo is well-optimized for your ${useCase} workflow${teamSize > 1 ? ` across ${teamSize} people` : ''}. You're on the right plans without obvious redundancy. The one area to watch: as your usage grows, revisit whether Team plans (Claude, ChatGPT) unlock enough collaboration value to justify their per-seat premium.`
  }

  const biggestWin = [...recs].sort((a, b) => b.monthlySavings - a.monthlySavings)[0]
  const annualSavings = monthlySavings * 12

  return `Your ${teamSize}-person team is spending $${currentSpend}/mo on AI tools and leaving $${monthlySavings}/mo ($${annualSavings}/year) on the table. The biggest opportunity is ${biggestWin.toolLabel}: ${biggestWin.reason.split('.')[0]}. For a ${useCase}-focused team, the optimized stack would cost $${currentSpend - monthlySavings}/mo — the same capabilities at ${Math.round((monthlySavings / currentSpend) * 100)}% lower cost.`
}
