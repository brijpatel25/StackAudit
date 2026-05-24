import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { runAudit, type AuditInput } from "@/lib/audit-engine"

function generateId(): string {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8)
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

async function generateAISummary(auditResult: ReturnType<typeof runAudit>, input: AuditInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return auditResult.summary
  try {
    const toolList = input.tools.map((t) => `${t.toolId} (${t.planId}, ${t.seats} seat(s), $${t.monthlySpend}/mo)`).join(", ")
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `You are a concise financial advisor. Generate a 90-100 word personalized summary for this AI tool audit. Tools: ${toolList}. Team size: ${input.teamSize}. Use case: ${input.useCase}. Monthly spend: $${auditResult.totalCurrentSpend}. Potential savings: $${auditResult.totalMonthlySavings}/mo. Write one paragraph, no bullets, CFO tone, start with their situation directly.`
        }]
      })
    })
    const data = await res.json()
    return data.content?.[0]?.text ?? auditResult.summary
  } catch {
    return auditResult.summary
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again in an hour." }, { status: 429 })
  }

  let body: AuditInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.tools || !Array.isArray(body.tools) || body.tools.length === 0) {
    return NextResponse.json({ error: "No tools provided" }, { status: 400 })
  }

  const auditResult = runAudit(body)
  const aiSummary = await generateAISummary(auditResult, body)
  const auditId = generateId()

  if (supabase) {
    try {
      await supabase.from("audits").insert({
        id: auditId,
        tools: body.tools,
        team_size: body.teamSize,
        use_case: body.useCase,
        total_monthly_savings: auditResult.totalMonthlySavings,
        total_annual_savings: auditResult.totalAnnualSavings,
        total_current_spend: auditResult.totalCurrentSpend,
        recommendations: auditResult.recommendations,
        ai_summary: aiSummary,
        created_at: new Date().toISOString(),
      })
    } catch {
      console.error("Supabase write failed")
    }
  }

  return NextResponse.json({ auditId, auditResult: { ...auditResult, summary: aiSummary } })
}
