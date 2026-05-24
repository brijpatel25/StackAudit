// PRICING DATA — verified against official vendor pages
// Every number here traces to PRICING_DATA.md
// Last verified: 2025-05-21

export const TOOLS = [
  'cursor',
  'github_copilot',
  'claude',
  'chatgpt',
  'anthropic_api',
  'openai_api',
  'gemini',
  'windsurf',
] as const

export type ToolId = typeof TOOLS[number]

export type UseCaseId = 'coding' | 'writing' | 'data' | 'research' | 'mixed'

export interface Plan {
  id: string
  label: string
  monthlyPerSeat: number
  minSeats?: number
  maxSeats?: number
  notes: string
}

export interface ToolConfig {
  id: ToolId
  label: string
  vendor: string
  plans: Plan[]
  primaryUseCase: UseCaseId[]
}

export const TOOL_CONFIGS: Record<ToolId, ToolConfig> = {
  cursor: {
    id: 'cursor',
    label: 'Cursor',
    vendor: 'Cursor',
    primaryUseCase: ['coding'],
    plans: [
      {
        id: 'hobby',
        label: 'Hobby',
        monthlyPerSeat: 0,
        notes: 'Limited completions, no GPT-4 by default',
      },
      {
        id: 'pro',
        label: 'Pro',
        monthlyPerSeat: 20,
        notes: '500 fast requests/month, unlimited slow requests',
      },
      {
        id: 'business',
        label: 'Business',
        monthlyPerSeat: 40,
        notes: 'SSO, centralized billing, privacy mode on',
      },
      {
        id: 'enterprise',
        label: 'Enterprise',
        monthlyPerSeat: 0,
        notes: 'Custom pricing, contact sales',
      },
    ],
  },
  github_copilot: {
    id: 'github_copilot',
    label: 'GitHub Copilot',
    vendor: 'GitHub',
    primaryUseCase: ['coding'],
    plans: [
      {
        id: 'individual',
        label: 'Individual',
        monthlyPerSeat: 10,
        notes: '$10/mo or $100/yr, IDE completions + chat',
      },
      {
        id: 'business',
        label: 'Business',
        monthlyPerSeat: 19,
        notes: 'Policy management, audit logs, IP indemnity',
      },
      {
        id: 'enterprise',
        label: 'Enterprise',
        monthlyPerSeat: 39,
        notes: 'Fine-tuning, knowledge bases, GitHub.com integration',
      },
    ],
  },
  claude: {
    id: 'claude',
    label: 'Claude',
    vendor: 'Anthropic',
    primaryUseCase: ['writing', 'research', 'coding', 'mixed'],
    plans: [
      {
        id: 'free',
        label: 'Free',
        monthlyPerSeat: 0,
        notes: 'Limited messages, Claude 3.5 Haiku',
      },
      {
        id: 'pro',
        label: 'Pro',
        monthlyPerSeat: 20,
        notes: '5× more usage than Free, Claude 3.5 Sonnet + Opus',
      },
      {
        id: 'max_5x',
        label: 'Max (5×)',
        monthlyPerSeat: 100,
        notes: '5× usage vs Pro — for very heavy power users',
      },
      {
        id: 'max_20x',
        label: 'Max (20×)',
        monthlyPerSeat: 200,
        notes: '20× usage vs Pro — for extreme usage only',
      },
      {
        id: 'team',
        label: 'Team',
        monthlyPerSeat: 30,
        minSeats: 5,
        notes: 'Per-seat, min 5 seats, shared workspaces, admin console',
      },
      {
        id: 'enterprise',
        label: 'Enterprise',
        monthlyPerSeat: 0,
        notes: 'Custom pricing, SSO, advanced security',
      },
    ],
  },
  chatgpt: {
    id: 'chatgpt',
    label: 'ChatGPT',
    vendor: 'OpenAI',
    primaryUseCase: ['writing', 'research', 'coding', 'mixed'],
    plans: [
      {
        id: 'free',
        label: 'Free',
        monthlyPerSeat: 0,
        notes: 'GPT-4o with limits',
      },
      {
        id: 'plus',
        label: 'Plus',
        monthlyPerSeat: 20,
        notes: 'GPT-4o, DALL·E, advanced voice, 5× faster',
      },
      {
        id: 'team',
        label: 'Team',
        monthlyPerSeat: 30,
        minSeats: 2,
        notes: 'Per-seat, shared workspace, admin console, no data training',
      },
      {
        id: 'enterprise',
        label: 'Enterprise',
        monthlyPerSeat: 0,
        notes: 'Custom pricing, SSO, longer context',
      },
    ],
  },
  anthropic_api: {
    id: 'anthropic_api',
    label: 'Anthropic API',
    vendor: 'Anthropic',
    primaryUseCase: ['coding', 'data', 'research', 'mixed'],
    plans: [
      {
        id: 'pay_as_you_go',
        label: 'Pay-as-you-go',
        monthlyPerSeat: 0,
        notes: 'Claude 3.5 Sonnet: $3/MTok in, $15/MTok out',
      },
    ],
  },
  openai_api: {
    id: 'openai_api',
    label: 'OpenAI API',
    vendor: 'OpenAI',
    primaryUseCase: ['coding', 'data', 'research', 'mixed'],
    plans: [
      {
        id: 'pay_as_you_go',
        label: 'Pay-as-you-go',
        monthlyPerSeat: 0,
        notes: 'GPT-4o: $2.50/MTok in, $10/MTok out',
      },
    ],
  },
  gemini: {
    id: 'gemini',
    label: 'Gemini',
    vendor: 'Google',
    primaryUseCase: ['writing', 'research', 'mixed'],
    plans: [
      {
        id: 'free',
        label: 'Free',
        monthlyPerSeat: 0,
        notes: 'Gemini 1.5 Flash with limits',
      },
      {
        id: 'advanced',
        label: 'Advanced (Google One AI)',
        monthlyPerSeat: 19.99,
        notes: 'Gemini 1.5 Pro, 2TB storage, Google One perks',
      },
      {
        id: 'workspace',
        label: 'Workspace Business',
        monthlyPerSeat: 30,
        notes: 'Gemini for Workspace, requires existing Workspace plan',
      },
    ],
  },
  windsurf: {
    id: 'windsurf',
    label: 'Windsurf',
    vendor: 'Codeium',
    primaryUseCase: ['coding'],
    plans: [
      {
        id: 'free',
        label: 'Free',
        monthlyPerSeat: 0,
        notes: 'Limited AI flows per month',
      },
      {
        id: 'pro',
        label: 'Pro',
        monthlyPerSeat: 15,
        notes: 'Unlimited fast completions, 10 premium AI flows/day',
      },
      {
        id: 'teams',
        label: 'Teams',
        monthlyPerSeat: 35,
        notes: 'Per-seat, admin, SSO, priority support',
      },
    ],
  },
}

export function getPlan(toolId: ToolId, planId: string): Plan | undefined {
  return TOOL_CONFIGS[toolId]?.plans.find((p) => p.id === planId)
}

export function getMonthlySpend(
  toolId: ToolId,
  planId: string,
  seats: number
): number {
  const plan = getPlan(toolId, planId)
  if (!plan) return 0
  return plan.monthlyPerSeat * seats
}
