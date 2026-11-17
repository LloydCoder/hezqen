"use client";

import { useState } from "react";
import Link from "next/link";

type NewsletterActionProps = {
  action: "confirm" | "unsubscribe";
  token: string;
};

export function NewsletterAction({ action, token }: NewsletterActionProps) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);

  async function runAction() {
    if (!token || submitting || complete) return;
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`/api/newsletter/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        status?: string;
      };
      setMessage(
        payload.message ??
          (response.ok ? "Your request has been recorded." : "This link is invalid or expired."),
      );
      setComplete(response.ok && payload.ok === true);
    } catch {
      setMessage("The request could not be completed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const actionLabel = action === "confirm" ? "Confirm subscription" : "Unsubscribe";
  const destination = action === "confirm" ? "/newsletter" : "/";

  return (
    <div className="newsletter-action">
      {!token ? (
        <p className="form-status" role="alert">
          This link is missing its verification token.
        </p>
      ) : (
        <button
          className="button button-primary"
          type="button"
          onClick={runAction}
          disabled={submitting || complete}
        >
          {submitting ? "Processing…" : complete ? "Request recorded" : actionLabel}
        </button>
      )}
      <p className="form-status" role="status" aria-live="polite">
        {message}
      </p>
      {complete ? (
        <p className="prose-signoff">
          <Link href={destination}>
            {action === "confirm" ? "Return to the newsletter" : "Return to HEZQEN"}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
