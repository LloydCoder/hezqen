# G9 — Monetization Acceptance

**Status:** Not implemented. No affiliate relationships, paid placements, checkout, payment processing or digital delivery are active.

## Commercial principles

- Editorial conclusions, coverage, rankings and reviews cannot be bought.
- Affiliate and referral relationships must be disclosed next to the relevant recommendation and in the central Commercial Disclosure policy.
- Sponsored placements must be labeled at the point of presentation and must not masquerade as independent reporting.
- Tinlance products, services, clients and related-party coverage require prominent disclosure and independent editorial handling.
- No open redirects, hidden tracking, dark patterns or preselected paid add-ons.

## Affiliate architecture

Use an allowlisted `PartnerOffers` collection and `/go/[slug]` redirect. The slug resolves only to a reviewed destination stored in the database; never accept an arbitrary target URL from a query string or CMS-authored script. Validate scheme and host, prevent redirect chaining, preserve a disclosure label, and use `rel="sponsored noopener noreferrer"` for outbound links.

Record only consented, minimal attribution events. Exclude bots and duplicate events, and do not expose partner secrets or commission terms in public payloads. Each offer requires written programme eligibility, geography, prohibited-traffic rules, commission basis, attribution window, payout thresholds, brand-use rules and termination terms before activation.

Potential partner programmes are research candidates only. No eligibility or commercial relationship is implied until confirmed directly with the provider.

## Digital products

Initial kit candidates:

1. Multi-GPU Tensor Parallelism Bundle.
2. Zero-Trust Docker Deployment Kit.
3. PII-Redaction Middleware Kit.

Each kit needs a complete manifest, version, supported platforms, license, security review, installation guide, changelog, update policy, support boundary, refund terms and signed download delivery. Do not sell a bundle that has not passed its own tests and documentation review.

## Checkout and order lifecycle

- Keep provider logic behind an internal payment adapter.
- Select a provider only after verifying merchant eligibility, supported country/entity, payout currency, fees, taxes, chargebacks, refunds, prohibited products, data processing and merchant-of-record responsibilities.
- Verify webhook signatures against the raw request body.
- Enforce idempotency and event deduplication.
- A browser redirect or client-side success message must never mark an order paid.
- Reconcile payment status with the provider before granting access.
- Use short-lived signed download URLs, rate-limited downloads and revocation for refunds/chargebacks.
- Maintain order, refund and entitlement audit events.

## Acceptance gates

- Written partner terms and approved disclosure.
- Secure redirect allowlist and open-redirect regression tests.
- Provider eligibility and compliance review.
- Test-mode checkout, signature verification, idempotency, duplicate webhook, failure, refund and chargeback tests.
- Secure download authorization and entitlement revocation tests.
- No live payments until the user explicitly authorizes the selected provider and production configuration.
