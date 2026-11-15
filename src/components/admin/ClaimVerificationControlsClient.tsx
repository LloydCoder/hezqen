"use client";

import { useEffect, useState } from "react";

type ClaimDocument = {
  updatedAt?: string;
  verificationStatus?: string;
  material?: boolean;
  evidence?: Array<{ id?: string | number; verificationStatus?: string }>;
};

type ApiResult = {
  error?: string;
  blockers?: string[];
  ok?: boolean;
};

export default function ClaimVerificationControlsClient({ claimId }: { claimId: string }) {
  const [claim, setClaim] = useState<ClaimDocument | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/claims/${encodeURIComponent(claimId)}?depth=2`, {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(async (response) => {
        const body = (await response.json()) as ClaimDocument & ApiResult;
        if (!response.ok) throw new Error(body.error || "Unable to load claim.");
        if (!cancelled) setClaim(body);
      })
      .catch((error: unknown) => {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Unable to load claim.");
      });
    return () => {
      cancelled = true;
    };
  }, [claimId]);

  async function verify() {
    if (!claim?.updatedAt) {
      setMessage("The saved claim timestamp is unavailable. Refresh the page and try again.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/claims/verify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ claimId, expectedUpdatedAt: claim.updatedAt }),
      });
      const body = (await response.json()) as ApiResult;
      if (!response.ok || body.ok === false) {
        const details = body.blockers?.length ? ` Blockers: ${body.blockers.join(", ")}.` : "";
        throw new Error(`${body.error || "Claim verification failed."}${details}`);
      }
      setMessage("Claim verified. The audit event was recorded.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Claim verification failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="hezqen-claim-verification-title"
      style={{ border: "1px solid var(--theme-elevation-200)", borderRadius: 8, padding: 16, marginBottom: 16 }}
    >
      <h3 id="hezqen-claim-verification-title" style={{ marginTop: 0 }}>Claim verification</h3>
      <p>Status: <strong>{claim?.verificationStatus ?? "Loading…"}</strong></p>
      <p>Claims become publishable only after their cited sources and preserved evidence pass verification.</p>
      {claim?.verificationStatus === "unverified" && claim.material !== false ? (
        <button type="button" onClick={() => void verify()} disabled={busy}>
          {busy ? "Verifying…" : "Verify claim and record review"}
        </button>
      ) : null}
      {message ? <p role="status" aria-live="polite">{message}</p> : null}
    </section>
  );
}
