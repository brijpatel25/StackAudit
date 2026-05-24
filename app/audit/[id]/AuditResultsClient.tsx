"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Recommendation {
  toolId: string
  toolLabel: string
  currentPlanLabel: string
  currentMonthlyCost: number
  recommendedAction: string
  recommendedPlanLabel?: string
  estimatedMonthlyCost: number
  monthlySavings: number
  annualSavings: number
  reason: string
  severity: "critical" | "warning" | "info" | "ok"
}

interface AuditResult {
  recommendations: Recommendation[]
  totalMonthlySavings: number
  totalAnnualSavings: number
  totalCurrentSpend: number
  totalOptimizedSpend: number
  isAlreadyOptimal: boolean
  highSavings: boolean
  summary: string
}

const SEVERITY_CONFIG = {
  critical: { label: "Action Required", color: "#ef4444", bg: "rgba(239,68,68,0.06)", border: "#ef4444", badgeBg: "rgba(239,68,68,0.12)", badgeColor: "#fca5a5" },
  warning:  { label: "Opportunity",     color: "#f59e0b", bg: "rgba(245,158,11,0.06)", border: "#f59e0b", badgeBg: "rgba(245,158,11,0.12)", badgeColor: "#fcd34d" },
  info:     { label: "Consider",        color: "#6b7280", bg: "rgba(107,114,128,0.04)", border: "#374151", badgeBg: "rgba(107,114,128,0.1)", badgeColor: "#9ca3af" },
  ok:       { label: "Optimized",       color: "#22c55e", bg: "rgba(34,197,94,0.06)",  border: "#22c55e", badgeBg: "rgba(34,197,94,0.12)", badgeColor: "#86efac" },
}

const TOOL_ICONS: Record<string, string> = {
  cursor: "⌥", github_copilot: "◈", claude: "◆", chatgpt: "◉",
  anthropic_api: "⬡", openai_api: "⬢", gemini: "✦", windsurf: "◌",
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1200
    const startTime = performance.now()
    function update(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
  }, [value])
  return <>{prefix}{display.toLocaleString()}{suffix}</>
}

export default function AuditResultsClient({ auditId }: { auditId: string }) {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const cached = sessionStorage.getItem("audit_" + auditId)
      if (cached) { setAuditResult(JSON.parse(cached)); setLoading(false); return }
    } catch {}
    setLoading(false)
  }, [auditId])

  function copyLink() {
    if (!mounted) return
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleEmail() {
    if (!email.includes("@")) return
    setEmailLoading(true)
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, auditId, monthlySavings: auditResult?.totalMonthlySavings }),
      })
      setEmailSent(true)
    } catch {}
    setEmailLoading(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 1s linear infinite" }}></div>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)", marginBottom: 8 }}>Analyzing your stack...</div>
          <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "var(--text-dim)" }}>Running audit engine</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!auditResult) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>◎</div>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text)", marginBottom: 12 }}>Audit not found</div>
          <p style={{ color: "var(--text-muted)", marginBottom: 28, lineHeight: 1.6 }}>This audit may have expired. Run a new one — it only takes 2 minutes.</p>
          <Link href="/" style={{ display: "inline-block", padding: "12px 28px", background: "linear-gradient(135deg, var(--accent) 0%, #4f46e5 100%)", color: "white", fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            Start a new audit
          </Link>
        </div>
      </div>
    )
  }

  const { recommendations, totalMonthlySavings, totalAnnualSavings, totalCurrentSpend, highSavings, summary, isAlreadyOptimal } = auditResult
  const criticalCount = recommendations.filter(r => r.severity === "critical").length

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 50, background: "rgba(8,9,10,0.9)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white", fontFamily: "Syne, sans-serif" }}>S</div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text)" }}>StackAudit</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={copyLink} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontFamily: "DM Mono, monospace", color: copied ? "var(--green)" : "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)", padding: "6px 14px", cursor: "pointer", transition: "all 0.2s" }}>
              {copied ? "✓ Copied!" : "⤴ Share"}
            </button>
            <Link href="/" style={{ fontSize: 12, fontFamily: "DM Mono, monospace", color: "var(--text-dim)", textDecoration: "none", padding: "6px 14px", border: "1px solid var(--border)", transition: "all 0.2s" }}>
              + New audit
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── Hero savings block ── */}
        {totalMonthlySavings > 0 ? (
          <div className="animate-fade-up" style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-dim)" }}>
                Audit complete — {recommendations.length} tool{recommendations.length !== 1 ? "s" : ""} reviewed
              </span>
              {criticalCount > 0 && (
                <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, padding: "3px 10px", background: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
                  {criticalCount} critical issue{criticalCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 40, marginBottom: 28 }}>
              <div>
                <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Monthly savings</div>
                <div className="animate-count-up delay-200" style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(52px, 10vw, 88px)", lineHeight: 1, letterSpacing: "-0.03em", color: "#ef4444" }}>
                  <AnimatedNumber value={totalMonthlySavings} prefix="$" suffix="/mo" />
                </div>
              </div>
              <div style={{ paddingBottom: 8 }}>
                <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Annual savings</div>
                <div className="animate-count-up delay-300" style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "clamp(28px, 5vw, 40px)", lineHeight: 1, letterSpacing: "-0.02em", color: "var(--text)" }}>
                  <AnimatedNumber value={totalAnnualSavings} prefix="$" suffix="/yr" />
                </div>
              </div>
            </div>

            {/* Spend bar */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 12, color: "var(--text-muted)" }}>
                <span>Current: <strong style={{ fontFamily: "DM Mono, monospace", color: "var(--text)" }}>${totalCurrentSpend}/mo</strong></span>
                <span style={{ color: "var(--green)", fontWeight: 600 }}>
                  {Math.round((totalMonthlySavings / totalCurrentSpend) * 100)}% reduction
                </span>
                <span>Optimized: <strong style={{ fontFamily: "DM Mono, monospace", color: "var(--green)" }}>${totalCurrentSpend - totalMonthlySavings}/mo</strong></span>
              </div>
              <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: "#ef4444", borderRadius: 4, opacity: 0.3 }}></div>
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${((totalCurrentSpend - totalMonthlySavings) / totalCurrentSpend) * 100}%`, background: "linear-gradient(90deg, var(--green), #16a34a)", borderRadius: 4, transition: "width 1s ease" }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-up" style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "32px 36px", background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "4px solid var(--green)" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>✓</div>
              <div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text)", marginBottom: 6 }}>You are spending well.</div>
                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Your ${totalCurrentSpend}/mo AI stack is already optimized for your team.</div>
              </div>
            </div>
          </div>
        )}

        {/* AI Summary */}
        {summary && (
          <div className="animate-fade-up delay-200" style={{ marginBottom: 32, position: "relative", overflow: "hidden", background: "var(--surface)", border: "1px solid var(--border-light)", padding: "28px 32px" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: "linear-gradient(180deg, var(--accent) 0%, var(--cyan) 100%)" }}></div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-bright)", marginBottom: 14 }}>
              ◆ AI Analysis
            </div>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8, fontSize: 15 }}>{summary}</p>
          </div>
        )}

        {/* Credex CTA */}
        {highSavings && (
          <div className="animate-fade-up delay-300" style={{ marginBottom: 32, padding: "28px 32px", background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(239,68,68,0.06) 100%)", border: "1px solid rgba(99,102,241,0.3)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(99,102,241,0.06)", pointerEvents: "none" }}></div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "var(--accent-bright)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              ★ High-savings case detected
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)", marginBottom: 10 }}>
              ${totalMonthlySavings}/mo is worth a conversation.
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.7, maxWidth: 520 }}>
              A Credex advisor can help capture these savings through AI credit strategies and vendor negotiations — typically 2-3x what self-service finds.
            </p>
            <a href="https://credex.com/consultation" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex" }}>
              Book a free Credex consultation →
            </a>
          </div>
        )}

        {/* Per-tool breakdown */}
        <div className="animate-fade-up delay-300" style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-dim)", marginBottom: 16 }}>
            Per-tool breakdown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recommendations.map((rec, i) => {
              const cfg = SEVERITY_CONFIG[rec.severity]
              return (
                <div key={i} className="animate-slide-right" style={{ animationDelay: `${0.3 + i * 0.07}s`, background: cfg.bg, border: `1px solid var(--border)`, borderLeft: `3px solid ${cfg.border}`, padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18, color: cfg.color }}>{TOOL_ICONS[rec.toolId] ?? "◎"}</span>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{rec.toolLabel}</span>
                          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 8px", background: cfg.badgeBg, color: cfg.badgeColor, border: `1px solid ${cfg.border}30` }}>
                            {cfg.label}
                          </span>
                        </div>
                        <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "var(--text-dim)" }}>
                          {rec.currentPlanLabel} · ${rec.currentMonthlyCost}/mo
                        </div>
                      </div>
                    </div>
                    {rec.monthlySavings > 0 ? (
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, color: cfg.color, lineHeight: 1 }}>
                          -${rec.monthlySavings}/mo
                        </div>
                        <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                          ${rec.annualSavings}/yr saved
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: "var(--green)", fontSize: 22, flexShrink: 0 }}>✓</div>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: "8px 16px" }}>
                    <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dim)", paddingTop: 2 }}>Action</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{rec.recommendedAction}</span>
                    <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dim)", paddingTop: 2 }}>Why</span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{rec.reason}</span>
                  </div>

                  {rec.monthlySavings > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 20, fontSize: 13 }}>
                      <span style={{ fontFamily: "DM Mono, monospace", color: "var(--text-dim)", textDecoration: "line-through" }}>${rec.currentMonthlyCost}/mo</span>
                      <span style={{ color: "var(--text-dim)" }}>→</span>
                      <span style={{ fontFamily: "DM Mono, monospace", color: "var(--green)", fontWeight: 600 }}>
                        ${rec.estimatedMonthlyCost}/mo {rec.recommendedPlanLabel && <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>({rec.recommendedPlanLabel})</span>}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Email capture */}
        <div className="animate-fade-up delay-500" style={{ border: "1px solid var(--border)", background: "var(--surface)", padding: "32px 36px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none" }}></div>
          {emailSent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 16px", color: "var(--green)" }}>✓</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)", marginBottom: 8 }}>Report saved.</div>
              <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Check your inbox for the full audit report.</div>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-dim)", marginBottom: 12 }}>
                {totalMonthlySavings > 0 ? "Save your report" : "Stay updated"}
              </div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, color: "var(--text)", marginBottom: 8 }}>
                {totalMonthlySavings > 0 ? "Get this audit by email." : "Get notified when savings appear."}
              </div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.7 }}>
                {totalMonthlySavings > 0
                  ? "PDF copy with implementation steps. For high-savings cases, a Credex advisor reviews personally."
                  : "AI pricing changes constantly. We will alert you when new optimizations apply to your stack."}
              </p>
              <div style={{ display: "flex", gap: 10, maxWidth: 480 }}>
                <input
                  type="email"
                  className="input-field"
                  placeholder="your@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleEmail()}
                  style={{ flex: 1 }}
                />
                <button onClick={handleEmail} disabled={emailLoading} className="btn-primary" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                  {emailLoading ? "..." : totalMonthlySavings > 0 ? "Send report" : "Notify me"}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 12, fontFamily: "DM Mono, monospace" }}>
                No spam. Unsubscribe anytime.
              </p>
            </>
          )}
        </div>

        {/* Share block */}
        <div className="animate-fade-up delay-600" style={{ border: "1px solid var(--border)", background: "var(--surface)", padding: "24px 28px", textAlign: "center" }}>
          <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-dim)", marginBottom: 10 }}>
            Share this audit
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
            Public link — email and company stripped. Safe to share.
          </p>
          <div style={{ display: "flex", gap: 10, maxWidth: 440, margin: "0 auto 16px" }}>
            <input readOnly value={mounted ? window.location.href : ""} className="input-field" style={{ flex: 1, fontSize: 12, fontFamily: "DM Mono, monospace", color: "var(--text-dim)" }} onClick={e => (e.target as HTMLInputElement).select()} />
            <button onClick={copyLink} className="btn-secondary" style={{ flexShrink: 0, minWidth: 80 }}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <a
              href={`https://twitter.com/intent/tweet?text=I%20ran%20my%20AI%20tools%20through%20StackAudit%20and%20found%20%24${totalMonthlySavings}%2Fmo%20in%20potential%20savings.%20Free%20audit%3A&url=${mounted ? encodeURIComponent(window.location.href) : ""}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, fontFamily: "DM Mono, monospace", color: "var(--text-dim)", textDecoration: "none", padding: "6px 14px", border: "1px solid var(--border)", transition: "all 0.2s" }}>
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${mounted ? encodeURIComponent(window.location.href) : ""}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, fontFamily: "DM Mono, monospace", color: "var(--text-dim)", textDecoration: "none", padding: "6px 14px", border: "1px solid var(--border)", transition: "all 0.2s" }}>
              Share on LinkedIn
            </a>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/" style={{ fontSize: 13, fontFamily: "DM Mono, monospace", color: "var(--text-dim)", textDecoration: "none" }}>
            ← Audit a different stack
          </Link>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "DM Mono, monospace", color: "var(--text-dim)" }}>
          <span>StackAudit by Credex</span>
          <span>Pricing verified May 2026</span>
        </div>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
