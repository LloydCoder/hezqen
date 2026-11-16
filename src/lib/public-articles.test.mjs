import assert from "node:assert/strict";
import test from "node:test";

import {
  getPublicCorrectionNotice,
  toPublicArticle,
  toPublicCorrectionHistory,
} from "./public-articles.ts";

test("only exposes articles that are both Payload-published and editorially published", () => {
  const published = toPublicArticle({
    id: 12,
    _status: "published",
    workflowStatus: "published",
    title: "A verified report",
    slug: "verified-report",
    excerpt: "Evidence-led reporting.",
    division: "ai-technology",
    publishedAt: "2026-11-16T08:00:00.000Z",
    updatedAt: "2026-11-16T08:30:00.000Z",
  });

  assert.equal(published?.slug, "verified-report");
  assert.equal(
    toPublicArticle({
      _status: "published",
      workflowStatus: "correction_required",
      title: "Hidden during correction",
      slug: "hidden-during-correction",
    }),
    null,
  );
  assert.equal(
    toPublicArticle({
      _status: "draft",
      workflowStatus: "published",
      title: "Draft",
      slug: "draft",
    }),
    null,
  );
});

test("does not expose internal correction reasons in the public correction notice", () => {
  const notice = getPublicCorrectionNotice({
    correctionStatus: "resolved",
    correctionPublicNote: "A figure was corrected after checking the original filing.",
    correctionReason: "Internal source review found a discrepancy in the reported figure.",
    correctionRequestedAt: "2026-11-15T10:00:00.000Z",
    correctionResolvedAt: "2026-11-16T08:00:00.000Z",
  });

  assert.deepEqual(notice, {
    note: "A figure was corrected after checking the original filing.",
    correctedAt: "2026-11-16T08:00:00.000Z",
  });
  assert.equal(JSON.stringify(notice).includes("Internal source review"), false);
});

test("does not publish a correction notice for open, empty, or malformed correction metadata", () => {
  assert.equal(
    getPublicCorrectionNotice({
      correctionStatus: "open",
      correctionPublicNote: "Pending review",
    }),
    null,
  );
  assert.equal(
    getPublicCorrectionNotice({
      correctionStatus: "resolved",
      correctionPublicNote: "   ",
      correctionResolvedAt: "2026-11-16T08:00:00.000Z",
    }),
    null,
  );
  assert.equal(
    getPublicCorrectionNotice({
      correctionStatus: "resolved",
      correctionPublicNote: "Correction made.",
      correctionResolvedAt: "not-a-date",
    }),
    null,
  );
});

test("publishes correction history from version snapshots without exposing internal fields", () => {
  const history = toPublicCorrectionHistory([
    {
      updatedAt: "2026-11-15T12:00:00.000Z",
      version: {
        correctionStatus: "resolved",
        correctionPublicNote: "An earlier correction was made.",
        correctionResolvedAt: "2026-11-15T12:00:00.000Z",
        correctionReason: "Confidential editor notes.",
      },
    },
    {
      updatedAt: "2026-11-16T08:00:00.000Z",
      version: {
        correctionStatus: "open",
        correctionPublicNote: "This is not resolved.",
        correctionReason: "Unverified internal report.",
      },
    },
  ]);

  assert.deepEqual(history, [
    {
      note: "An earlier correction was made.",
      correctedAt: "2026-11-15T12:00:00.000Z",
    },
  ]);
  assert.equal(JSON.stringify(history).includes("Confidential editor notes"), false);
});

test("deduplicates the current correction against its saved version snapshot", () => {
  const current = {
    note: "A correction was published.",
    correctedAt: "2026-11-16T08:00:00.000Z",
  };
  const history = toPublicCorrectionHistory(
    [
      {
        updatedAt: current.correctedAt,
        version: {
          correctionStatus: "resolved",
          correctionPublicNote: current.note,
          correctionResolvedAt: current.correctedAt,
        },
      },
    ],
    current,
  );
  assert.deepEqual(history, [current]);
});
