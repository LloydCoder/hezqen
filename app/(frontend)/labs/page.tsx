import type { Metadata } from "next";
import Link from "next/link";
import { LAB_CALCULATORS } from "@/domain/labs/calculator-suite";

export const metadata: Metadata = {
  title: "Engineering Calculators & Infrastructure Tools | HEZQEN Labs",
  description: "Transparent calculators for private AI, GPU infrastructure, cloud economics, cybersecurity and engineering decisions.",
  alternates: { canonical: "/labs" },
};

export default function LabsIndexPage() {
  const categories = [...new Set(LAB_CALCULATORS.map((item) => item.category))];
  return (
    <div style={{ background: "#f4f5f7", minHeight: "65vh", padding: "3rem 1.25rem 5rem" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <p style={{ color: "#a35f00", fontSize: ".75rem", fontWeight: 800, letterSpacing: ".14em" }}>HEZQEN / LABS</p>
        <h1 style={{ color: "#0b1b33", fontSize: "clamp(2.4rem, 5vw, 4rem)", letterSpacing: "-.04em", margin: ".5rem 0" }}>Engineering decisions, made measurable.</h1>
        <p style={{ color: "#5b6678", maxWidth: 760, lineHeight: 1.7 }}>Sixteen interactive planning tools with visible assumptions and deterministic formulas. Replace illustrative defaults with your own workload, contract and infrastructure inputs.</p>\n        <section style={{ marginTop: "2.5rem" }}>\n          <h2 style={{ color: "#0b1b33", fontSize: "1.2rem", borderBottom: "1px solid #dce1e8", paddingBottom: ".75rem" }}>AI Infrastructure & GPU Intelligence</h2>\n          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "1rem", marginTop: "1rem" }}>\n            {[{ href: "/labs/vram", title: "Local LLM VRAM & Quantization Calculator", description: "Estimate model weight memory, KV cache and runtime reserve for local inference." }, { href: "/labs/ai-cost", title: "Cloud API vs Self-Hosted AI Cost Break-Even", description: "Compare user-supplied API token prices with self-hosted GPU and infrastructure costs." }].map((item) => (\n              <Link key={item.href} href={item.href} style={{ display: "block", background: "#fff", border: "1px solid #e0e4e9", borderRadius: 12, padding: "1.25rem", color: "#0b1b33", textDecoration: "none" }}>\n                <span style={{ color: "#a35f00", fontSize: ".68rem", fontWeight: 800, letterSpacing: ".12em" }}>OPEN CALCULATOR ↗</span>\n                <h3 style={{ fontSize: "1.05rem", margin: ".65rem 0" }}>{item.title}</h3>\n                <p style={{ color: "#5b6678", fontSize: ".88rem", lineHeight: 1.55, margin: 0 }}>{item.description}</p>\n              </Link>\n            ))}\n          </div>\n        </section>
        {categories.map((category) => (
          <section key={category} style={{ marginTop: "2.5rem" }}>
            <h2 style={{ color: "#0b1b33", fontSize: "1.2rem", borderBottom: "1px solid #dce1e8", paddingBottom: ".75rem" }}>{category}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "1rem", marginTop: "1rem" }}>
              {LAB_CALCULATORS.filter((item) => item.category === category).map((item) => (
                <Link key={item.slug} href={`/labs/${item.slug}`} style={{ display: "block", background: "#fff", border: "1px solid #e0e4e9", borderRadius: 12, padding: "1.25rem", color: "#0b1b33", textDecoration: "none" }}>
                  <span style={{ color: "#a35f00", fontSize: ".68rem", fontWeight: 800, letterSpacing: ".12em" }}>OPEN CALCULATOR ↗</span>
                  <h3 style={{ fontSize: "1.05rem", margin: ".65rem 0" }}>{item.title}</h3>
                  <p style={{ color: "#5b6678", fontSize: ".88rem", lineHeight: 1.55, margin: 0 }}>{item.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
        <p style={{ color: "#5b6678", fontSize: ".82rem", lineHeight: 1.6, marginTop: "2rem" }}>The fourteen tools on this index are additional to the existing VRAM sizing and API-versus-self-hosted AI cost calculators. All results are estimates, not provider quotes, benchmarks, legal advice or investment recommendations.</p>
      </div>
    </div>
  );
}
