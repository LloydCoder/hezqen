"use client";

import { useState, type FormEvent } from "react";

import type { NewsletterSignupSource } from "@/domain/newsletter/consent";

interface NewsletterSignupFormProps {
  source?: NewsletterSignupSource;
  compact?: boolean;
}

export function NewsletterSignupForm({
  source = "unknown",
  compact = false,
}: NewsletterSignupFormProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, consent, source, website }),
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message ?? "We could not process the request. Please try again.");
        return;
      }
      setMessage(
        payload.message ??
          "If this address is eligible, a confirmation email will arrive shortly.",
      );
      setEmail("");
      setConsent(false);
      setWebsite("");
    } catch {
      setMessage("The request could not be completed. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className={compact ? "newsletter-signup newsletter-signup-compact" : "newsletter-signup"}
      onSubmit={submit}
    >
      <div className="newsletter-signup-fields">
        <label className="form-field">
          <span>Email address</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="form-honeypot" aria-hidden="true">
          Leave this field empty
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </label>
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
          />
          <span>
            I agree to receive The HEZQEN Intelligence Brief by email. I can unsubscribe at any
            time. Read the <a href="/privacy">privacy notice</a>.
          </span>
        </label>
        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Subscribe"}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      <p className="form-status" role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
