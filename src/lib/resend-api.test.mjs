import assert from "node:assert/strict";
import test from "node:test";

import {
  sendNewsletterConfirmation,
  sendTransactionalEmail,
  syncNewsletterContact,
  unsubscribeNewsletterContact,
} from "./resend-api.ts";

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const apiKey = "re_test_only_not_a_real_secret";
const options = {
  apiKey,
  newsletterTemplateId: "template_test",
  newsletterTopicId: "topic_test",
  newsletterFrom: "HEZQEN <newsletter@tinlance.com>",
  transactionalFrom: "HEZQEN <hello@tinlance.com>",
};

test("sends newsletter confirmation through the published template with an idempotency key", async () => {
  let captured;
  const fetchImpl = async (url, init) => {
    captured = { url, init, body: JSON.parse(init.body) };
    return jsonResponse(200, { id: "email_test_1" });
  };
  const result = await sendNewsletterConfirmation(
    {
      email: "reader@example.com",
      confirmationUrl: "https://hezqen.example/newsletter/confirm?token=opaque",
      idempotencyKey: "newsletter-confirm/subscriber-1/token-hash",
    },
    { ...options, fetchImpl },
  );
  assert.equal(result, "email_test_1");
  assert.equal(captured.url, "https://api.resend.com/emails");
  assert.equal(captured.init.headers.authorization, `Bearer ${apiKey}`);
  assert.equal(captured.init.headers["idempotency-key"], "newsletter-confirm/subscriber-1/token-hash");
  assert.deepEqual(captured.body.template, {
    id: "template_test",
    variables: { CONFIRMATION_URL: "https://hezqen.example/newsletter/confirm?token=opaque" },
  });
});

test("creates a contact with topic opt-in only after the app has confirmed consent", async () => {
  let captured;
  const fetchImpl = async (url, init) => {
    captured = { url, init, body: JSON.parse(init.body) };
    return jsonResponse(201, { id: "contact_test_1" });
  };
  const result = await syncNewsletterContact(
    {
      email: "reader@example.com",
      consentAt: "2026-11-17T10:00:00.000Z",
      consentVersion: "hezqen-intelligence-brief-v1",
      signupSource: "labs",
      unsubscribeUrl: "https://hezqen.example/newsletter/unsubscribe?token=signed",
    },
    { ...options, fetchImpl },
  );
  assert.deepEqual(result, { status: "synced", contactId: "contact_test_1" });
  assert.equal(captured.url, "https://api.resend.com/contacts");
  assert.equal(captured.body.unsubscribed, false);
  assert.deepEqual(captured.body.topics, [{ id: "topic_test", subscription: "opt_in" }]);
  assert.equal(captured.body.properties.hezqen_newsletter_status, "confirmed");
  assert.equal(
    captured.body.properties.hezqen_newsletter_unsubscribe_url,
    "https://hezqen.example/newsletter/unsubscribe?token=signed",
  );
});

test("does not override a provider-wide unsubscribe on an existing contact", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    if (calls === 1) return jsonResponse(409, { message: "Contact already exists" });
    return jsonResponse(200, { id: "contact_test_2", unsubscribed: true });
  };
  const result = await syncNewsletterContact(
    {
      email: "reader@example.com",
      consentAt: "2026-11-17T10:00:00.000Z",
      consentVersion: "hezqen-intelligence-brief-v1",
      signupSource: "footer",
      unsubscribeUrl: "https://hezqen.example/newsletter/unsubscribe?token=signed",
    },
    { ...options, fetchImpl },
  );
  assert.deepEqual(result, { status: "blocked", contactId: "contact_test_2" });
  assert.equal(calls, 2);
});

test("updates an existing contact's properties and topic preference", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, method: init.method, body: init.body ? JSON.parse(init.body) : null });
    if (calls.length === 1) return jsonResponse(409, { message: "Contact already exists" });
    if (calls.length === 2) return jsonResponse(200, { id: "contact_test_3", unsubscribed: false });
    return jsonResponse(200, { id: "contact_test_3" });
  };
  const result = await syncNewsletterContact(
    {
      email: "reader@example.com",
      consentAt: "2026-11-17T10:00:00.000Z",
      consentVersion: "hezqen-intelligence-brief-v1",
      signupSource: "article",
      unsubscribeUrl: "https://hezqen.example/newsletter/unsubscribe?token=signed",
    },
    { ...options, fetchImpl },
  );
  assert.deepEqual(result, { status: "synced", contactId: "contact_test_3" });
  assert.equal(calls.length, 4);
  assert.equal(calls[2].method, "PATCH");
  assert.equal(calls[3].method, "PATCH");
  assert.deepEqual(calls[3].body.topics, [{ id: "topic_test", subscription: "opt_in" }]);
});

test("records topic-level unsubscribe without changing global contact status", async () => {
  let captured;
  const fetchImpl = async (url, init) => {
    captured = { url, init, body: JSON.parse(init.body) };
    return jsonResponse(200, { id: "contact_test_4" });
  };
  await unsubscribeNewsletterContact(
    { email: "reader@example.com" },
    { ...options, fetchImpl },
  );
  assert.equal(
    captured.url,
    "https://api.resend.com/contacts/reader%40example.com/topics",
  );
  assert.equal(captured.init.method, "PATCH");
  assert.deepEqual(captured.body.topics, [{ id: "topic_test", subscription: "opt_out" }]);
});

test("sends architecture-review transactional email with a stable idempotency key", async () => {
  let captured;
  const fetchImpl = async (url, init) => {
    captured = { url, init, body: JSON.parse(init.body) };
    return jsonResponse(200, { id: "email_test_2" });
  };
  const result = await sendTransactionalEmail(
    {
      to: "sales@tinlance.com",
      subject: "New architecture review request",
      html: "<p>New request</p>",
      text: "New request",
      idempotencyKey: "architecture-review/lead-1/notification",
      replyTo: "sales@tinlance.com",
    },
    { ...options, fetchImpl },
  );
  assert.equal(result, "email_test_2");
  assert.equal(captured.body.from, "HEZQEN <hello@tinlance.com>");
  assert.equal(captured.body.reply_to, "sales@tinlance.com");
  assert.equal(captured.init.headers["idempotency-key"], "architecture-review/lead-1/notification");
});
