import type { EmailAdapter, SendEmailOptions } from "payload";

export interface ResendEmailAdapterOptions {
  apiKey: string;
  defaultFromAddress: string;
  defaultFromName: string;
  fetchImpl?: typeof fetch;
}

function normalizeAddress(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object" && "address" in value) {
    const address = (value as { address?: unknown }).address;
    return typeof address === "string" && address.trim() ? address.trim() : null;
  }
  return null;
}

function normalizeRecipients(value: SendEmailOptions["to"]): string[] {
  const values = Array.isArray(value) ? value : [value];
  return values.map(normalizeAddress).filter((address): address is string => address !== null);
}

export function createResendEmailAdapter(options: ResendEmailAdapterOptions): EmailAdapter {
  const fetchImpl = options.fetchImpl ?? fetch;
  const from = \`\${options.defaultFromName} <\${options.defaultFromAddress}>\`;

  return () => ({
    name: "hezqen-resend",
    defaultFromAddress: options.defaultFromAddress,
    defaultFromName: options.defaultFromName,
    sendEmail: async (message) => {
      const to = normalizeRecipients(message.to);
      if (to.length === 0) throw new Error("Resend email requires at least one valid recipient.");
      if (!message.subject?.trim()) throw new Error("Resend email requires a subject.");

      const payload: Record<string, unknown> = {
        from,
        to,
        subject: message.subject,
      };
      if (typeof message.html === "string") payload.html = message.html;
      if (typeof message.text === "string") payload.text = message.text;
      if (!payload.html && !payload.text) {
        throw new Error("Resend email requires an HTML or plain-text body.");
      }

      const response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: \`Bearer \${options.apiKey}\`,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 300);
        throw new Error(\`Resend delivery failed with HTTP \${response.status}: \${detail}\`);
      }
      return response.json();
    },
  });
}
