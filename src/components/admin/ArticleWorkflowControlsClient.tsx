"use client";

import { useEffect, useState } from "react";

type ArticleDocument = {
  workflowStatus?: string;
  revision?: number;
};

type ApiResult = {
  error?: string;
  code?: string;
  blockers?: string[];
  ok?: boolean;
};

const transitions: Record<string, string[]> = {
  pitch: ["research"],
  research: ["draft"],
  draft: ["fact_check"],
  fact_check: ["draft", "editorial_review"],
  editorial_review: ["draft", "approved"],
  approved: ["draft", "scheduled", "published"],
  scheduled: ["draft", "published"],
  published: ["correction_required", "archived"],
  correction_required: ["draft"],
  archived: [],
};

const statusLabels: Record<string, string> = {
  pitch: "Pitch",
  research: "Research",
  draft: "Draft",
  fact_check: "Fact-check",
  editorial_review: "Editorial review",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  correction_required: "Correction required",
  archived: "Archived",
};

export default function ArticleWorkflowControlsClient({ articleId }: { articleId: string }) {
  const [article, setArticle] = useState<ArticleDocument | null>(null);
  const [targetStatus, setTargetStatus] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionPublicNote, setCorrectionPublicNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadArticle() {
    const response = await fetch(`/api/articles/${encodeURIComponent(articleId)}?depth=0`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    const body = (await response.json()) as ArticleDocument & ApiResult;
    if (!response.ok) throw new Error(body.error || "Unable to load article workflow state.");
    setArticle(body);
  }

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/articles/${encodeURIComponent(articleId)}?depth=0`, {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(async (response) => {
        const body = (await response.json()) as ArticleDocument & ApiResult;
        if (!response.ok) throw new Error(body.error || "Unable to load article workflow state.");
        if (!cancelled) setArticle(body);
      })
      .catch((error: unknown) => {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Unable to load article.");
      });
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  const availableTransitions = transitions[article?.workflowStatus ?? ""] ?? [];

  async function send(path: string, payload: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(path, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as ApiResult;
      if (!response.ok || body.ok === false) {
        const details = body.blockers?.length ? ` Blockers: ${body.blockers.join(", ")}.` : "";
        throw new Error(`${body.error || body.code || "Workflow action failed."}${details}`);
      }
      setMessage("Workflow action completed.");
      await loadArticle();
      setTargetStatus("");
      setScheduledFor("");
      setCorrectionReason("");
      setCorrectionPublicNote("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Workflow action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function transition(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!article || !targetStatus) return;
    const payload: Record<string, unknown> = {
      articleId,
      expectedRevision: article.revision,
      targetStatus,
    };
    if (targetStatus === "scheduled") {
      if (!scheduledFor) {
        setMessage("Choose a publication date and time.");
        return;
      }
      const timestamp = new Date(scheduledFor);
      if (Number.isNaN(timestamp.getTime())) {
        setMessage("The scheduled publication date is invalid.");
        return;
      }
      payload.scheduledFor = timestamp.toISOString();
    }
    if (targetStatus === "correction_required") {
      payload.correctionReason = correctionReason;
      payload.correctionPublicNote = correctionPublicNote;
    }
    await send("/api/editorial/workflow", payload);
  }

  async function review(action: "complete_fact_check" | "review_disclosures") {
    if (!article) return;
    await send("/api/editorial/review", {
      articleId,
      expectedRevision: article.revision,
      action,
    });
  }

  return (
    <section
      aria-labelledby="hezqen-workflow-title"
      style={{ border: "1px solid var(--theme-elevation-200)", borderRadius: 8, padding: 16, marginBottom: 16 }}
    >
      <h3 id="hezqen-workflow-title" style={{ marginTop: 0 }}>HEZQEN editorial workflow</h3>
      {article ? (
        <p>
          Current state: <strong>{statusLabels[article.workflowStatus ?? ""] ?? article.workflowStatus ?? "Unknown"}</strong>
          {" · "}Revision {article.revision ?? "—"}
        </p>
      ) : (
        <p>Loading the saved article state…</p>
      )}
      <p>Save article edits before running a workflow action. Actions apply to the saved revision.</p>
      {availableTransitions.length > 0 ? (
        <form onSubmit={transition} style={{ display: "grid", gap: 10, maxWidth: 560 }}>
          <label>
            Target state
            <select
              value={targetStatus}
              onChange={(event) => setTargetStatus(event.target.value)}
              required
              style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
            >
              <option value="">Choose a transition</option>
              {availableTransitions.map((status) => (
                <option key={status} value={status}>{statusLabels[status] ?? status}</option>
              ))}
            </select>
          </label>
          {targetStatus === "scheduled" ? (
            <label>
              Publish at
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(event) => setScheduledFor(event.target.value)}
                required
                style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>
          ) : null}
          {targetStatus === "correction_required" ? (
            <>
              <label>
                Internal correction reason
                <textarea
                  value={correctionReason}
                  onChange={(event) => setCorrectionReason(event.target.value)}
                  required
                  rows={2}
                  style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                />
              </label>
              <label>
                Public correction notice
                <textarea
                  value={correctionPublicNote}
                  onChange={(event) => setCorrectionPublicNote(event.target.value)}
                  required
                  rows={2}
                  style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                />
              </label>
            </>
          ) : null}
          <button type="submit" disabled={busy || !article || !targetStatus}>
            {busy ? "Working…" : "Apply workflow transition"}
          </button>
        </form>
      ) : null}
      {article?.workflowStatus === "fact_check" ? (
        <button type="button" disabled={busy} onClick={() => void review("complete_fact_check")} style={{ marginTop: 12 }}>
          Mark fact-check complete
        </button>
      ) : null}
      {article?.workflowStatus === "editorial_review" ? (
        <button type="button" disabled={busy} onClick={() => void review("review_disclosures")} style={{ marginTop: 12 }}>
          Confirm disclosure review
        </button>
      ) : null}
      {message ? <p role="status" aria-live="polite">{message}</p> : null}
    </section>
  );
}
