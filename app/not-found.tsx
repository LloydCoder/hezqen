import Link from "next/link";
export default function NotFound() {
  return (
    <section className="not-found">
      <div className="container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> 404 / NOT FOUND
        </p>
        <h1>
          This page is
          <br />
          <em>off the record.</em>
        </h1>
        <p>The page may have moved, or the address may be incorrect.</p>
        <Link className="button button-primary" href="/">
          Return to HEZQEN
        </Link>
      </div>
    </section>
  );
}
