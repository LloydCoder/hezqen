import assert from "node:assert/strict";
import test from "node:test";

import { createResendEmailAdapter } from "./resend-email-adapter.ts";

test("sends Payload authentication messages through the configured verified sender", async () => {
  let requestUrl = "";
  let requestInit: RequestInit | undefined;
  const adapter = createResendEmailAdapter({
    apiKey: "re_test_only",
    defaultFromAddress: "no-reply@tinlance.com",
    defaultFromName: "HEZQEN",
    fetchImpl: async (input, init) => {
      requestUrl = String(input);
      requestInit = init;
      return Response.json({ id: "email-test-id" });
    },
  });
  const initialized = adapter({ payload: {} as never });
  const result = await initialized.sendEmail({
    to: "editor@example.com",
    subject: "Reset your HEZQEN password",
    html: "<p>Reset your password.</p>",
  });

  assert.equal(requestUrl, "https://api.resend.com/emails");
  assert.equal(result && typeof result, "object");
  assert.equal(requestInit?.method, "POST");
  assert.equal(
    (requestInit?.headers as Record<string, string>).authorization,
    "Bearer re_test_only",
  );
  const body = JSON.parse(String(requestInit?.body)) as Record<string, unknown>;
  assert.equal(body.from, "HEZQEN <no-reply@tinlance.com>");
  assert.deepEqual(body.to, ["editor@example.com"]);
});

test("rejects invalid recipients before making a network request", async () => {
  let called = false;
  const adapter = createResendEmailAdapter({
    apiKey: "re_test_only",
    defaultFromAddress: "no-reply@tinlance.com",
    defaultFromName: "HEZQEN",
    fetchImpl: async () => {
      called = true;
      return Response.json({ id: "unexpected" });
    },
  });

  await assert.rejects(
    adapter({ payload: {} as never }).sendEmail({
      to: [],
      subject: "Test",
      text: "Test",
    }),
    /at least one valid recipient/,
  );
  assert.equal(called, false);
});

test("surfaces provider rejection so password-reset delivery cannot appear successful", async () => {
  const adapter = createResendEmailAdapter({
    apiKey: "re_test_only",
    defaultFromAddress: "no-reply@tinlance.com",
    defaultFromName: "HEZQEN",
    fetchImpl: async () => new Response("domain not verified", { status: 403 }),
  });

  await assert.rejects(
    adapter({ payload: {} as never }).sendEmail({
      to: "editor@example.com",
      subject: "Test",
      text: "Test",
    }),
    /HTTP 403: domain not verified/,
  );
});
