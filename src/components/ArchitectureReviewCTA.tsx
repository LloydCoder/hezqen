type ArchitectureReviewCTAProps = {
  calculator: string;
};

export function ArchitectureReviewCTA({ calculator }: ArchitectureReviewCTAProps) {
  const subject = encodeURIComponent(`HEZQEN architecture review — ${calculator}`);

  return (
    <section className="architecture-review-cta" aria-labelledby="architecture-review-heading">
      <div className="container architecture-review-inner">
        <div>
          <p className="section-label">TINLANCE ENGINEERING SERVICES</p>
          <h2 id="architecture-review-heading">Need help sizing your AI infrastructure?</h2>
          <p>
            Request an architecture review covering GPU requirements, model deployment, inference
            costs and infrastructure choices.
          </p>
          <p className="architecture-review-disclosure">
            HEZQEN is owned by Tinlance. This is a commercial enquiry for Tinlance services;
            editorial coverage and conclusions remain governed by HEZQEN's published standards.
          </p>
        </div>
        <a className="button button-primary" href={`mailto:sales@tinlance.com?subject=${subject}`}>
          Request an architecture review <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
