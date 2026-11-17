import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const NEWSLETTER_CONSENT_VERSION = "hezqen-intelligence-brief-v1-2026-11-17";
export const NEWSLETTER_CONFIRMATION_TTL_MS = 24 * 60 * 60 * 1000;
export const NEWSLETTER_RESEND_COOLDOWN_MS = 15 * 60 * 1000;
export const NEWSLETTER_SEND_WINDOW_MS = 24 * 60 * 60 * 1000;
export const NEWSLETTER_MAX_CONFIRMATION_SENDS_PER_DAY = 3;

export type NewsletterSignupSource = "footer" | "article" | "labs" | "contact" | "unknown";

export interface ConfirmationToken {
  token: string;
  tokenHash: string;
  expiresAt: string;
}

export interface UnsubscribeTokenPayload {
  subscriberId: string;
  confirmedAt: string;
}

export function normalizeNewsletterEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.includes("..")
  ) {
    return null;
  }
  return email;
}

export function normalizeNewsletterSignupSource(value: unknown): NewsletterSignupSource {
  return value === "footer" || value === "article" || value === "labs" || value === "contact"
    ? value
    : "unknown";
}

export function createConfirmationToken(now = Date.now()): ConfirmationToken {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(now + NEWSLETTER_CONFIRMATION_TTL_MS).toISOString(),
  };
}

export function hashConfirmationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function canSendConfirmation(
  sendCount: number,
  windowStartedAt: string | null | undefined,
  lastAttemptAt: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!Number.isInteger(sendCount) || sendCount < 0) return false;
  const windowStart = windowStartedAt ? Date.parse(windowStartedAt) : Number.NaN;
  const windowActive = Number.isFinite(windowStart) && now - windowStart < NEWSLETTER_SEND_WINDOW_MS;
  if (windowActive && sendCount >= NEWSLETTER_MAX_CONFIRMATION_SENDS_PER_DAY) return false;
  const lastAttempt = lastAttemptAt ? Date.parse(lastAttemptAt) : Number.NaN;
  if (Number.isFinite(lastAttempt) && now - lastAttempt < NEWSLETTER_RESEND_COOLDOWN_MS) return false;
  return true;
}

export function createUnsubscribeToken(
  subscriberId: string,
  confirmedAt: string,
  secret: string,
): string {
  if (!subscriberId || subscriberId.length > 128 || !Number.isFinite(Date.parse(confirmedAt))) {
    throw new RangeError("A valid subscriber ID and confirmation timestamp are required.");
  }
  if (secret.length < 32) throw new RangeError("Unsubscribe signing secret is too short.");
  const payload = Buffer.from(subscriberId + "." + Date.parse(confirmedAt)).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return payload + "." + signature;
}

export function verifyUnsubscribeToken(
  token: string,
  secret: string,
): UnsubscribeTokenPayload | null {
  if (secret.length < 32 || token.length > 512) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  let supplied: Buffer;
  try {
    supplied = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const separator = decoded.lastIndexOf(".");
    if (separator <= 0) return null;
    const subscriberId = decoded.slice(0, separator);
    const timestamp = Number(decoded.slice(separator + 1));
    if (!subscriberId || subscriberId.length > 128 || !Number.isFinite(timestamp)) return null;
    return {
      subscriberId,
      confirmedAt: new Date(timestamp).toISOString(),
    };
  } catch {
    return null;
  }
}
