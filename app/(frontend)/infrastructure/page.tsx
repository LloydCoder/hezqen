import type { Metadata } from "next";
import Link from "next/link";

import { infrastructureProducts } from "@/lib/infrastructure-products";

export const metadata: Metadata = {
  title: "Infrastructure Kits",
  description:
    "Inspect HEZQEN's local AI, privacy, multi-GPU and air-gapped RAG engineering kits. All products are currently engineering previews.",
  alternates: { canonical: "/infrastructure" },
  openGraph: {
    title: "HEZQEN Infrastructure — Engineering Kits",
    description:
      "Practical infrastructure kits for local AI, privacy, multi-GPU planning and disconnected RAG deployments.",
    url: "/infrastructure",
  },
};

export default function InfrastructurePage() {
  return (
    <div className="infrastructure-page">
      <section className="infrastructure-hero">
        <div className="container">
          <p className="eyebrow">
            <span className="eyebrow-line" /> HEZQEN INFRASTRUCTURE
          </p>
          <h1>
            Infrastructure for <em>local, private and resilient AI.</em>
          </h1>
          <p className="infrastructure-lede">
            Practical, inspectable engineering kits for teams building local inference,
            privacy controls, multi-GPU deployments and disconnected retrieval systems.
          </p>
          <div className="infrastructure-disclosure" role="note">
            <strong>Engineering preview — not production certification.</strong>
            <span>
              The kits have automated CI and runtime acceptance evidence, but several hardware,
              privacy, supply-chain and commercial-release gates remain open. Review each kit's
              limitations before adapting it to a production environment.
            </span>
          </div>
        </div>
      </section>

      <section className="infrastructure-products-section">
        <div className="container">
          <div className="infrastructure-section-heading">
            <div>
              <p className="section-label">01 / THE PRODUCT LINE</p>
              <h2>Five kits. One shared standard.</h2>
            </div>
            <p>
              Each kit is versioned and documented in the separate HEZQEN Infrastructure Standard
              repository. Source code remains open for inspection and adaptation.
            </p>
          </div>

          <div className="infrastructure-product-grid">
            {infrastructureProducts.map((product) => (
              <article className="infrastructure-product-card" key={product.id}>
                <div className="infrastructure-product-top">
                  <span className="infrastructure-product-id">{product.id}</span>
                  <span className="infrastructure-status">{product.status}</span>
                </div>
                <h2>{product.name}</h2>
                <p className="infrastructure-product-summary">{product.summary}</p>

                <div className="infrastructure-product-block">
                  <h3>Included</h3>
                  <ul>
                    {product.capabilities.map((capability) => (
                      <li key={capability}>{capability}</li>
                    ))}
                  </ul>
                </div>

                <div className="infrastructure-product-meta">
                  <span>License: {product.license}</span>
                  <span>Platform: {product.platforms.join(", ")}</span>
                </div>

                <details className="infrastructure-product-details">
                  <summary>Validation and limitations</summary>
                  <div>
                    <h3>Current validation</h3>
                    <p>{product.validation}</p>
                    <h3>Known limitations</h3>
                    <p>{product.limitations}</p>
                    <h3>Network requirements</h3>
                    <p>{product.networkMode}</p>
                  </div>
                </details>

                <a
                  className="infrastructure-source-link"
                  href={product.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Inspect source and technical documentation <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="infrastructure-assurance">
        <div className="container infrastructure-assurance-grid">
          <p className="section-label">02 / RELEASE DISCIPLINE</p>
          <div>
            <h2>Test evidence is not a certification.</h2>
            <p>
              Automated workflows verify defined behaviors in controlled environments. They do not
              replace physical GPU benchmarks, representative PII accuracy studies, a complete
              transitive SBOM, signed provenance, third-party license review or production security
              assessment.
            </p>
            <p>
              Commercial release remains gated on those checks, supported-platform documentation,
              installation and rollback runbooks, support terms and versioned release artifacts.
            </p>
            <div className="infrastructure-assurance-actions">
              <a
                className="button button-primary"
                href="https://github.com/LloydCoder/hezqen-infrastructure-standard"
                target="_blank"
                rel="noopener noreferrer"
              >
                View the HIES repository <span aria-hidden="true">↗</span>
              </a>
              <Link className="text-link" href="/editorial-standards">
                Read HEZQEN's evidence standards <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
