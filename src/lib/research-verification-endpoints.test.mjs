import assert from "node:assert/strict";
import test from "node:test";
import { claimVerifyEndpoint } from "./research-verification-endpoints.ts";

const expectedUpdatedAt = "2026-11-15T12:00:00.000Z";

function makeRequest({ user, claim, article }) {
  return {
    user,
    json: async () => ({ claimId: "claim-1", expectedUpdatedAt }),
    payload: {
      findByID: async ({ collection }) => (collection === "claims" ? claim : article),
      db: {
        beginTransaction: async () => {
          throw new Error("The verification transaction must not start for rejected actors.");
        },
      },
    },
  };
}

test("claim verification rejects a fact-checker who is not assigned to the article", async () => {
  const response = await claimVerifyEndpoint.handler(
    makeRequest({
      user: { id: 11, role: "fact_checker", active: true },
      claim: {
        id: 1,
        article: 7,
        material: true,
        verificationStatus: "unverified",
        updatedAt: expectedUpdatedAt,
      },
      article: {
        id: 7,
        workflowStatus: "fact_check",
        assignedFactChecker: 22,
      },
    }),
  );
  assert.equal(response.status, 403);
  assert.match((await response.json()).error, /assigned editor or fact-checker/);
});

test("claim verification rejects unlinked claims", async () => {
  const response = await claimVerifyEndpoint.handler(
    makeRequest({
      user: { id: 11, role: "fact_checker", active: true },
      claim: {
        id: 1,
        article: null,
        material: true,
        verificationStatus: "unverified",
        updatedAt: expectedUpdatedAt,
      },
      article: null,
    }),
  );
  assert.equal(response.status, 422);
  assert.match((await response.json()).error, /linked to an article/);
});

test("claim verification is restricted to the fact-check stage", async () => {
  const response = await claimVerifyEndpoint.handler(
    makeRequest({
      user: { id: 11, role: "fact_checker", active: true },
      claim: {
        id: 1,
        article: 7,
        material: true,
        verificationStatus: "unverified",
        updatedAt: expectedUpdatedAt,
      },
      article: {
        id: 7,
        workflowStatus: "draft",
        assignedFactChecker: 11,
      },
    }),
  );
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /fact-check stage/);
});

test("claim verification rejects non-material claims", async () => {
  const response = await claimVerifyEndpoint.handler(
    makeRequest({
      user: { id: 11, role: "fact_checker", active: true },
      claim: {
        id: 1,
        article: 7,
        material: false,
        verificationStatus: "unverified",
        updatedAt: expectedUpdatedAt,
      },
      article: {
        id: 7,
        workflowStatus: "fact_check",
        assignedFactChecker: 11,
      },
    }),
  );
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /material claims/);
});
