import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export type Database = {
  audits: {
    id: string
    tools: object
    team_size: number
    use_case: string
    total_monthly_savings: number
    total_annual_savings: number
    total_current_spend: number
    recommendations: object
    ai_summary: string | null
    created_at: string
  }
  leads: {
    id: string
    audit_id: string
    email: string
    company_name: string | null
    role: string | null
    team_size: number | null
    created_at: string
  }
}
