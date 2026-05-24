"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TOOL_CONFIGS, type ToolId, type UseCaseId, TOOLS } from "@/lib/pricing-data"
import type { ToolInput, AuditInput } from "@/lib/audit-engine"

const STORAGE_KEY = "stackaudit_form_state"

const USE_CASES: { id: UseCaseId; label: string; desc: string; icon: string }[] = [
  { id: "coding",   label: "Coding",   desc: "Dev, code review, debugging", icon: "⌨" },
  { id: "writing",  label: "Writing",  desc: "Content, copy, docs",          icon: "✍" },
  { id: "data",     label: "Data",     desc: "Analysis, SQL, reporting",      icon: "◉" },
  { id: "research", label: "Research", desc: "Synthesis, summaries",          icon: "◎" },
  { id: "mixed",    label: "Mixed",    desc: "Multiple use cases",            icon: "⊞" },
]

const TOOL_ICONS: Record<string, string> = {
  cursor: "⌥",
  github_copilot: "◈",
  claude: "◆",
  chatgpt: "◉",
  anthropic_api: "⬡",
  openai_api: "⬢",
  gemini: "✦",
  windsurf: "◌",
}

interface FormState {
  tools: { [key in ToolId]?: { enabled: boolean; planId: string; seats: number; monthlySpend: string } }
  teamSize: string
  useCase: UseCaseId
}

export default function HomePage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({ tools: {}, teamSize: "3", useCase: "mixed" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"tools" | "context">("tools")

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setForm(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)) } catch {}
  }, [form])

  function toggleTool(toolId: ToolId) {
    const config = TOOL_CONFIGS[toolId]
    const firstPlan = config.plans[0]
    setForm(prev => ({
      ...prev,
      tools: {
        ...prev.tools,
        [toolId]: prev.tools[toolId]?.enabled
          ? { ...prev.tools[toolId]!, enabled: false }
          : { enabled: true, planId: firstPlan.id, seats: 1, monthlySpend: String(firstPlan.monthlyPerSeat) },
      },
    }))
  }

  function updateTool(toolId: ToolId, field: string, value: string | number) {
    setForm(prev => {
      const tool = prev.tools[toolId] ?? { enabled: true, planId: "", seats: 1, monthlySpend: "0" }
      const updated = { ...tool, [field]: value }
      if (field === "planId" || field === "seats") {
        const config = TOOL_CONFIGS[toolId]
        const plan = config.plans.find(p => p.id === (field === "planId" ? value : updated.planId))
        const seats = field === "seats" ? Number(value) : updated.seats
        if (plan && plan.monthlyPerSeat > 0) updated.monthlySpend = String(plan.monthlyPerSeat * seats)
      }
      return { ...prev, tools: { ...prev.tools, [toolId]: updated } }
    })
  }

  const enabledTools = TOOLS.filter(id => form.tools[id]?.enabled)
  const totalSpend = enabledTools.reduce((sum, id) => sum + (parseFloat(form.tools[id]?.monthlySpend ?? "0") || 0), 0)

  async function handleSubmit() {
    if (enabledTools.length === 0) { setError("Select at least one tool to audit."); return }
    setError("")
    setLoading(true)

    const auditInput: AuditInput = {
      tools: enabledTools.map(toolId => ({
        toolId,
        planId: form.tools[toolId]!.planId,
        seats: Number(form.tools[toolId]!.seats),
        monthlySpend: parseFloat(form.tools[toolId]!.monthlySpend) || 0,
      } as ToolInput)),
      teamSize: parseInt(form.teamSize) || 1,
      useCase: form.useCase,
    }

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auditInput),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Audit failed")
      sessionStorage.setItem("audit_" + data.auditId, JSON.stringify(data.auditResult))
      router.push("/audit/" + data.auditId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen" style={{ position: "relative", zIndex: 1 }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 50, background: "rgba(8,9,10,0.85)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white", fontFamily: "Syne, sans-serif" }}>S</div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text)" }}>StackAudit</span>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginLeft: 4 }}>by Credex</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span className="badge">Free · No signup</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Hero */}
        <div className="animate-fade-up" style={{ paddingTop: 72, paddingBottom: 56, textAlign: "center" }}>
          <div className="badge badge-accent animate-fade-up" style={{ marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-bright)", display: "inline-block" }}></span>
            AI Spend Auditor — Free, instant, no account needed
          </div>

          <h1 className="font-display animate-fade-up delay-100" style={{ fontSize: "clamp(40px, 7vw, 76px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 20 }}>
            Stop overpaying for<br />
            <span className="text-shimmer">AI tools.</span>
          </h1>

          <p className="animate-fade-up delay-200" style={{ fontSize: 17, color: "var(--text-muted)", maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Enter your tools and plans. Get an instant, finance-defensible audit — exactly where you&apos;re wasting money and what to do about it.
          </p>

          <div className="animate-fade-up delay-300" style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {["2-minute audit", "No email required", "Finance-grade reasoning"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 13 }}>
                <span style={{ color: "var(--green)", fontSize: 12 }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div className="animate-fade-up delay-300" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          {(["tools", "context"] as const).map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {i > 0 && <div style={{ width: 48, height: 1, background: step === "context" ? "var(--accent)" : "var(--border)", transition: "background 0.3s" }}></div>}
              <button
                onClick={() => s === "tools" ? setStep("tools") : enabledTools.length > 0 && setStep("context")}
                style={{
                  display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0,
                  color: step === s ? "var(--text)" : "var(--text-dim)",
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontFamily: "DM Mono, monospace", fontWeight: 500,
                  background: step === s ? "var(--accent)" : "var(--surface-2)",
                  border: `1px solid ${step === s ? "var(--accent)" : "var(--border)"}`,
                  color: step === s ? "white" : "var(--text-dim)",
                  transition: "all 0.2s",
                }}>{i + 1}</div>
                <span style={{ fontSize: 13, fontWeight: step === s ? 600 : 400, transition: "all 0.2s", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "DM Mono, monospace" }}>
                  {s === "tools" ? "Select tools" : "Context"}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* ── STEP 1: Tools ── */}
        {step === "tools" && (
          <div className="animate-fade-up">
            <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20, fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Click the tools you currently pay for
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 36 }}>
              {TOOLS.map(toolId => {
                const config = TOOL_CONFIGS[toolId]
                const isActive = !!form.tools[toolId]?.enabled
                return (
                  <button key={toolId} onClick={() => toggleTool(toolId)} className={"tool-btn" + (isActive ? " active" : "")}>
                    <div style={{ fontSize: 22, marginBottom: 8, color: isActive ? "var(--accent-bright)" : "var(--text-dim)" }}>
                      {TOOL_ICONS[toolId]}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? "var(--text)" : "var(--text-muted)", marginBottom: 3, fontFamily: "Syne, sans-serif" }}>
                      {config.label}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "DM Mono, monospace" }}>{config.vendor}</div>
                    {isActive && (
                      <div style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "white", fontSize: 10, lineHeight: 1 }}>✓</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tool config cards */}
            {enabledTools.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16, fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Configure each tool
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {enabledTools.map((toolId, i) => {
                    const config = TOOL_CONFIGS[toolId]
                    const t = form.tools[toolId]!
                    const isApiTool = toolId === "anthropic_api" || toolId === "openai_api"
                    const currentPlan = config.plans.find(p => p.id === t.planId)
                    return (
                      <div key={toolId} className="glass glass-hover animate-slide-right" style={{ padding: 20, animationDelay: `${i * 0.06}s` }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ fontSize: 20, color: "var(--accent-bright)" }}>{TOOL_ICONS[toolId]}</div>
                            <div>
                              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{config.label}</div>
                              <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "DM Mono, monospace" }}>{config.vendor}</div>
                            </div>
                          </div>
                          <button onClick={() => toggleTool(toolId)} style={{ fontSize: 11, color: "var(--text-dim)", background: "none", border: "1px solid var(--border)", padding: "4px 10px", cursor: "pointer", fontFamily: "DM Mono, monospace", transition: "all 0.2s" }}
                            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "var(--red)"; (e.target as HTMLElement).style.color = "var(--red)"; }}
                            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "var(--border)"; (e.target as HTMLElement).style.color = "var(--text-dim)"; }}>
                            Remove
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: isApiTool ? "1fr 1fr" : "1fr 1fr 1fr", gap: 12 }}>
                          <div>
                            <label style={{ fontSize: 11, color: "var(--text-dim)", display: "block", marginBottom: 6, fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Plan</label>
                            <select className="select-field" value={t.planId} onChange={e => updateTool(toolId, "planId", e.target.value)}>
                              {config.plans.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                            </select>
                            {currentPlan && <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6, lineHeight: 1.5 }}>{currentPlan.notes}</div>}
                          </div>
                          {!isApiTool && (
                            <div>
                              <label style={{ fontSize: 11, color: "var(--text-dim)", display: "block", marginBottom: 6, fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Seats</label>
                              <input type="number" min="1" className="input-field" value={t.seats} onChange={e => updateTool(toolId, "seats", e.target.value)} />
                            </div>
                          )}
                          <div>
                            <label style={{ fontSize: 11, color: "var(--text-dim)", display: "block", marginBottom: 6, fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Monthly ($)</label>
                            <input type="number" min="0" className="input-field" value={t.monthlySpend} onChange={e => updateTool(toolId, "monthlySpend", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button onClick={() => setStep("context")} disabled={enabledTools.length === 0} className="btn-primary">
                Continue
                <span style={{ fontSize: 16 }}>→</span>
              </button>
              {enabledTools.length === 0 && (
                <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Select at least one tool</span>
              )}
              {enabledTools.length > 0 && (
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {enabledTools.length} tool{enabledTools.length !== 1 ? "s" : ""} · <span style={{ fontFamily: "DM Mono, monospace", color: "var(--accent-bright)" }}>${totalSpend}/mo</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: Context ── */}
        {step === "context" && (
          <div className="animate-fade-up">
            {/* Team size */}
            <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6, color: "var(--text)" }}>Team size</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Total headcount including yourself</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <input type="number" min="1" className="input-field" style={{ maxWidth: 120 }} value={form.teamSize}
                  onChange={e => setForm(prev => ({ ...prev, teamSize: e.target.value }))} />
                <span style={{ fontSize: 13, color: "var(--text-dim)" }}>people</span>
              </div>
            </div>

            {/* Use case */}
            <div className="glass" style={{ padding: 28, marginBottom: 24 }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6, color: "var(--text)" }}>Primary use case</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>What does your team mainly use AI for?</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                {USE_CASES.map(uc => (
                  <button key={uc.id} onClick={() => setForm(prev => ({ ...prev, useCase: uc.id }))}
                    style={{
                      textAlign: "left", padding: "14px 16px", border: `1px solid ${form.useCase === uc.id ? "var(--accent)" : "var(--border)"}`,
                      background: form.useCase === uc.id ? "rgba(99,102,241,0.12)" : "var(--surface)",
                      cursor: "pointer", transition: "all 0.2s",
                    }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{uc.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.useCase === uc.id ? "var(--accent-bright)" : "var(--text)", fontFamily: "Syne, sans-serif" }}>{uc.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 3 }}>{uc.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary preview */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dim)", marginBottom: 14 }}>Audit preview</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {enabledTools.map(toolId => {
                  const t = form.tools[toolId]!
                  const config = TOOL_CONFIGS[toolId]
                  const plan = config.plans.find(p => p.id === t.planId)
                  return (
                    <div key={toolId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)" }}>
                        <span style={{ color: "var(--text-dim)", fontSize: 14 }}>{TOOL_ICONS[toolId]}</span>
                        {config.label}
                        <span style={{ color: "var(--text-dim)", fontFamily: "DM Mono, monospace", fontSize: 12 }}>{plan?.label}</span>
                      </span>
                      <span style={{ fontFamily: "DM Mono, monospace", color: "var(--text)" }}>${parseFloat(t.monthlySpend).toFixed(0)}/mo</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600 }}>
                <span style={{ color: "var(--text-muted)" }}>Total</span>
                <span style={{ fontFamily: "DM Mono, monospace", color: "var(--accent-bright)" }}>${totalSpend.toFixed(0)}/mo</span>
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 13, color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", padding: "10px 16px", marginBottom: 20 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep("tools")} className="btn-secondary">← Back</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ minWidth: 160 }}>
                {loading ? (
                  <>
                    <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Auditing...
                  </>
                ) : <>Run audit <span>→</span></>}
              </button>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 14 }}>
              Email asked after results — never before.
            </p>
          </div>
        )}
      </main>

      {/* Floating stats */}
      <div className="animate-fade-up delay-500" style={{ position: "fixed", bottom: 28, right: 28, display: "flex", flexDirection: "column", gap: 8, zIndex: 40 }}>
        {[
          { label: "Avg savings found", value: "$340/mo" },
          { label: "Audits run", value: "2,400+" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(17,18,20,0.92)", border: "1px solid var(--border)", padding: "10px 16px", backdropFilter: "blur(20px)", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 15, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--accent-bright)" }}>{s.value}</span>
            <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "DM Mono, monospace" }}>{s.label}</span>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
