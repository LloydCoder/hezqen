"use client";

import { useEffect, useState } from "react";

type EvidenceDocument = {
  sha256?: string;
  verificationStatus?: string;
  source?: string | number | { id?: string | number; title?: string };
};

type ApiResult = {
  error?: string;
  ok?: boolean;
};

export default function EvidenceVerificationControlsClient({ evidenceId }: { evidenceId: string }) {
  const [evidence, setEvidence] = useState<EvidenceDocument | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/evidence/${encodeURIComponent(evidenceId)}?depth=1`, {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(async (response) => {
        const body = (await response.json()) as EvidenceDocument & ApiResult;
        if (!response.ok) throw new Error(body.error || "Unable to load evidence.");
        if (!cancelled) setEvidence(body);
      })
      .catch((error: unknown) => {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Unable to load evidence.");
      });
    return () => {
      cancelled = true;
    };
  }, [evidenceId]);

  async function verify() {
    if (!evidence?.sha256) {
      setMessage("The saved SHA-256 digest is unavailable. Refresh the page and try again.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/evidence/verify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ evidenceId, expectedSha256: evidence.sha256 }),
      });
      const body = (await response.json()) as ApiResult;
      if (!response.ok || body.ok === false) {
        throw new Error(body.error || "Evidence verification failed.");
      }
      setMessage("Evidence bytes and source metadata verified. The audit event was recorded.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Evidence verification failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="hezqen-evidence-verification-title"
      style={{ border: "1px solid var(--theme-elevation-200)", borderRadius: 8, padding: 16, marginBottom: 16 }}
    >
      <h3 id="hezqen-evidence-verification-title" style={{ marginTop: 0 }}>Evidence integrity verification</h3>
      <p>Status: <strong>{evidence?.verificationStatus ?? "Loading…"}</strong></p>
      {evidence?.sha256 ? <p>SHA-256: <code>{evidence.sha256}</code></p> : null}
      {evidence?.verificationStatus === "preserved" ? (
        <button type="button" onClick={() => void verify()} disabled={busy}>
          {busy ? "Checking bytes…" : "Verify private evidence object"}
        </button>
      ) : null}
      {message ? <p role="status" aria-live="polite">{message}</p> : null}
    </section>
  );
}
