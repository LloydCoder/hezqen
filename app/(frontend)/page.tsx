import Link from "next/link";
import { divisions, site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-line" /> {site.positioning}
            </p>
            <h1>
              Understand the forces shaping our <em>technological future.</em>
            </h1>
            <p className="hero-description">
              Independent reporting, original research and technical analysis for the people
              building, governing and investing in what comes next.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#divisions">
                Explore our coverage <span aria-hidden="true">↓</span>
              </a>
              <Link className="text-link" href="/editorial-standards">
                How we work <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <aside className="hero-aside" aria-label="HEZQEN editorial principle">
            <div className="aside-topline">
              <span>THE HEZQEN APPROACH</span>
              <span className="signal-dot" aria-hidden="true" />
            </div>
            <p className="aside-statement">
              Signal over noise.
              <br />
              Evidence over assertion.
              <br />
              <em>Insight over imitation.</em>
            </p>
            <div className="aside-rule" />
            <p className="aside-caption">
              A global perspective on the technologies, systems and decisions changing the world.
            </p>
            <span className="aside-index">HQ / 001</span>
          </aside>
        </div>
      </section>
      <section className="intro-strip">
        <div className="container intro-grid">
          <p className="section-label">01 / OUR MANDATE</p>
          <p className="intro-statement">
            Technology is moving faster than understanding. HEZQEN exists to close that gap with
            work that is <strong>original, rigorous and useful.</strong>
          </p>
        </div>
      </section>
      <section className="divisions-section" id="divisions">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="section-label">02 / EDITORIAL DIVISIONS</p>
              <h2>Four lenses. One connected world.</h2>
            </div>
            <p className="section-intro">
              From foundational infrastructure to the economics of innovation, our coverage connects
              the technical detail to its wider consequences.
            </p>
          </div>
          <div className="division-grid">
            {divisions.map((division) => (
              <Link
                className="division-card"
                href={`/divisions/${division.slug}`}
                key={division.slug}
              >
                <div className="division-card-top">
                  <span className="division-number">{division.number}</span>
                  <span className="card-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <h3>{division.name}</h3>
                <p>{division.description}</p>
                <span className="card-cta">
                  Explore division <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="platform-section">
        <div className="container">
          <p className="section-label">03 / THE HEZQEN PLATFORM</p>
          <div className="platform-grid">
            <article className="platform-card platform-card-featured">
              <span className="platform-kicker">01 — PUBLICATION</span>
              <h2>HEZQEN Media</h2>
              <p>
                Reporting, investigations, analysis and explainers that make complex developments
                understandable.
              </p>
            </article>
            <article className="platform-card">
              <span className="platform-kicker">02 — EXPERIMENTATION</span>
              <h2>HEZQEN Labs</h2>
              <p>
                Practical tools, transparent calculators, benchmarks and engineering experiments.
              </p>
              <Link className="text-link" href="/labs/vram">
                Explore the VRAM calculator <span aria-hidden="true">↗</span>
              </Link>
              <Link className="text-link" href="/labs/ai-cost">
                Compare API and self-hosted AI costs <span aria-hidden="true">↗</span>
              </Link>
              <Link className="text-link" href="/labs">Explore all 16 HEZQEN Labs calculators <span aria-hidden="true">↗</span></Link>
            </article>
            <article className="platform-card">
              <span className="platform-kicker">03 — DECISION SUPPORT</span>
              <h2>HEZQEN Intelligence</h2>
              <p>
                Deeper research and briefings for leaders making consequential technology and
                business decisions.
              </p>
            </article>
            <article className="platform-card">
              <span className="platform-kicker">04 — ENGINEERING PRODUCTS</span>
              <h2>HEZQEN Infrastructure</h2>
              <p>Open engineering kits for local AI, privacy, multi-GPU planning and air-gapped retrieval deployments.</p>
              <Link className="text-link" href="/infrastructure">Explore the infrastructure kits <span aria-hidden="true">↗</span></Link>
            </article>
          </div>
        </div>
      </section>
      <section className="standards-band">
        <div className="container standards-grid">
          <p className="section-label">04 / OUR STANDARD</p>
          <div>
            <h2>
              AI may assist the newsroom. <em>AI must not become the newsroom.</em>
            </h2>
            <p>
              Every published item has accountable human authorship and editorial approval. Material
              claims must be traceable to evidence. Our standards are public.
            </p>
            <Link className="standards-link" href="/editorial-standards">
              Read the editorial standards <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
