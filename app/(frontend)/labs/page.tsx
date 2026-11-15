import type { Metadata } from "next";
import Link from "next/link";
import { calculators } from "@/domain/labs/calculator-suite";

const legacy = [
  {
    slug: "vram",
    title: "LLM VRAM & Quantization Calculator",
    category: "AI Infrastructure & GPU Intelligence",
    description: "Estimate model weights, KV cache and runtime headroom for local LLM inference.",
  },
  {
    slug: "ai-cost",
    title: "Cloud API vs Self-Hosted AI Break-Even Calculator",
    category: "AI Infrastructure & GPU Intelligence",
    description: "Compare token-priced API spend with fixed self-hosted GPU and infrastructure costs.",
  },
] as const;

const catalog = [...legacy, ...calculators];

export const metadata: Metadata = {
  title: "HEZQEN Labs Calculators",
  description:
    "Sixteen transparent engineering and business calculators for private AI, cloud infrastructure, cybersecurity and technology economics.",
  alternates: { canonical: "/labs" },
};

export default function LabsIndexPage() {
  return (
    <main className="vram-page">
      <div className="container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> HEZQEN LABS / ENGINEERING INTELLIGENCE
        </p>
        <h1>
          Tools for <em>better decisions.</em>
        </h1>
        <p className="vram-lede">
          Transparent calculators for AI infrastructure, private AI, cloud economics, cybersecurity
          and technology businesses. Every result exposes its assumptions and limitations.
        </p>
        <div className="labs-catalog">
          {catalog.map((item, index) => (
            <article className="labs-catalog-card" key={item.slug}>
              <p className="section-label">
                {String(index + 1).padStart(2, "0")} / {item.category}
              </p>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <Link className="text-link" href={"/labs/" + item.slug}>
                Open calculator <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
        <section className="vram-method">
          <p className="section-label">THE COMPLETE TOOLSET</p>
          <h2>16 calculators across four decision areas</h2>
          <p>
            Each tool is a planning model, not a substitute for measured benchmarks, vendor quotes,
            legal advice or qualified professional review.
          </p>
        </section>
      </div>
    </main>
  );
}
