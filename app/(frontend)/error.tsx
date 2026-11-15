"use client";

import Link from "next/link";

export default function FrontendError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="not-found" role="alert">
      <div className="container">
        <p className="eyebrow"><span className="eyebrow-line" /> 500 / TEMPORARY ERROR</p>
        <h1>Something went <em>off course.</em></h1>
        <p>The page could not be completed. Try again, or return to the HEZQEN homepage.</p>
        <div className="hero-actions">
          <button className="button button-primary" type="button" onClick={reset}>Try again</button>
          <Link className="text-link" href="/">Return to HEZQEN</Link>
        </div>
      </div>
    </section>
  );
}
