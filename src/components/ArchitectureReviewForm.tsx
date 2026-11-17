"use client";

import { useState, type FormEvent } from "react";

type ArchitectureReviewFormProps = {
  source?: "article" | "labs" | "contact" | "unknown";
  calculator?: string;
};

const initialValues = {
  name: "",
  email: "",
  company: "",
  role: "",
  projectType: "ai-infrastructure",
  challenge: "",
  budgetRange: "unspecified",
  timeline: "exploring",
  contactConsent: false,
  website: "",
};

export function ArchitectureReviewForm({
  source = "unknown",
  calculator = "",
}: ArchitectureReviewFormProps) {
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function update(key: keyof typeof initialValues, value: string | boolean) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/architecture-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, source, calculator }),
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message ?? "We could not submit the request. Please try again.");
        return;
      }
      setMessage(
        payload.message ??
          "Your request has been received. The Tinlance team will review it and follow up.",
      );
      setValues(initialValues);
    } catch {
      setMessage("The request could not be completed. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="hezqen-form" onSubmit={submit}>
      <div className="form-grid">
        <label className="form-field">
          <span>Name</span>
          <input
            autoComplete="name"
            maxLength={120}
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            required
          />
        </label>
        <label className="form-field">
          <span>Work email</span>
          <input
            type="email"
            autoComplete="email"
            maxLength={254}
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            required
          />
        </label>
        <label className="form-field">
          <span>Company (optional)</span>
          <input
            autoComplete="organization"
            maxLength={120}
            value={values.company}
            onChange={(event) => update("company", event.target.value)}
          />
        </label>
        <label className="form-field">
          <span>Your role (optional)</span>
          <input
            autoComplete="organization-title"
            maxLength={80}
            value={values.role}
            onChange={(event) => update("role", event.target.value)}
          />
        </label>
        <label className="form-field">
          <span>What do you need help with?</span>
          <select
            value={values.projectType}
            onChange={(event) => update("projectType", event.target.value)}
            required
          >
            <option value="ai-infrastructure">AI infrastructure</option>
            <option value="cloud-architecture">Cloud architecture</option>
            <option value="cybersecurity">Cybersecurity</option>
            <option value="ai-agents">AI agents and automation</option>
            <option value="performance-cost">Performance and cost review</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="form-field">
          <span>Expected timeline</span>
          <select
            value={values.timeline}
            onChange={(event) => update("timeline", event.target.value)}
            required
          >
            <option value="exploring">Exploring options</option>
            <option value="0-30-days">Within 30 days</option>
            <option value="1-3-months">1–3 months</option>
            <option value="3-6-months">3–6 months</option>
            <option value="6-plus-months">More than 6 months</option>
          </select>
        </label>
        <label className="form-field">
          <span>Indicative budget (optional)</span>
          <select
            value={values.budgetRange}
            onChange={(event) => update("budgetRange", event.target.value)}
          >
            <option value="unspecified">Prefer not to say</option>
            <option value="under-5000">Under $5,000</option>
            <option value="5000-15000">$5,000–$15,000</option>
            <option value="15000-50000">$15,000–$50,000</option>
            <option value="50000-plus">$50,000+</option>
          </select>
        </label>
      </div>
      <label className="form-field">
        <span>What are you trying to achieve?</span>
        <textarea
          rows={6}
          maxLength={2000}
          value={values.challenge}
          onChange={(event) => update("challenge", event.target.value)}
          placeholder="Describe the system, constraints, workload or security problem. Do not include credentials or confidential data."
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
          value={values.website}
          onChange={(event) => update("website", event.target.value)}
        />
      </label>
      <label className="form-checkbox">
        <input
          type="checkbox"
          checked={values.contactConsent}
          onChange={(event) => update("contactConsent", event.target.checked)}
          required
        />
        <span>
          I agree that Tinlance may use the information above to respond to this architecture-review
          request. This is not consent to receive marketing emails. See the{" "}
          <a href="/privacy">privacy notice</a>.
        </span>
      </label>
      <button className="button button-primary" type="submit" disabled={submitting}>
        {submitting ? "Sending request…" : "Request an architecture review"}
        <span aria-hidden="true">↗</span>
      </button>
      <p className="form-status" role="status" aria-live="polite">
        {message}
      </p>
      <p className="form-footnote">
        HEZQEN is owned by Tinlance. This form is a commercial enquiry for Tinlance services; it
        does not influence HEZQEN's editorial coverage or conclusions.
      </p>
    </form>
  );
}
