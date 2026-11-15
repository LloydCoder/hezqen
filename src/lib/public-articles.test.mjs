import assert from "node:assert/strict";
import test from "node:test";

import {
  getPublicCorrectionNotice,
  toPublicArticle,
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
