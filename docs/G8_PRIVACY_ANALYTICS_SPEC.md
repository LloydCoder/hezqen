# G8 — Privacy, Consent and Analytics Specification

**Status:** Architecture and control requirements prepared; implementation and legal review pending.  
**Default:** No non-essential tracking before affirmative consent.  
**Production gate:** Do not enable pixels, analytics SDKs, server-side conversion APIs or advertising cookies until the data inventory, consent controls, privacy notice and retention controls are approved.

## 1. Current state

The current public site has privacy and cookie notices. The cookie notice says no advertising or analytics programme is active in this release. Do not load analytics or marketing scripts merely to make the consent interface appear complete. The architecture-review privacy notice has been corrected to state that lead requests are stored for human review and automated email acknowledgement/notification is not guaranteed.

The current release does not yet provide a complete consent management platform, analytics event store, or third-party pixel adapter. G8 is not accepted.

## 2. Legal and regulatory design inputs

This is an engineering specification, not legal advice. HEZQEN is a global publication; counsel must determine applicable laws, controller/processor roles, transfer mechanisms and regional requirements before production activation.

- Nigeria's NDPC General Application and Implementation Directive 2025, Article 19, states that cookies and tracking tools generally require consent, with necessary-cookie exceptions; consent must be freely given, informed and specific, with a conspicuous banner and clear accept/reject choices. It also requires clear information about purpose, controller and withdrawal. [NDPC NDP Act GAID 2025](https://ndpc.gov.ng/wp-content/uploads/2025/03/NDP-ACT-GAID-2025-MARCH-20TH.pdf)
- The Nigeria Data Protection Act 2023 requires affirmative, informed consent where consent is the lawful basis, prohibits treating silence/inactivity as consent, and requires notice of the right to withdraw. [Nigeria Data Protection Act 2023](https://ndpc.gov.ng/wp-content/uploads/2024/03/Nigeria_Data_Protection_Act_2023.pdf)
- GDPR Article 7 requires the controller to demonstrate consent and make withdrawal as easy as giving consent. [GDPR, EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/)
- UK PECR guidance requires active consent for non-essential cookies and similar technologies, with an exception for technologies strictly necessary for a service requested by the user. [ICO cookies guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/)

## 3. Consent categories

The consent interface must expose distinct, off-by-default categories:

| Category | Default | Examples | Control |
|---|---|---|---|
| Strictly necessary | Always on | Security, load balancing, session integrity, consent preference | Explain; cannot be disabled where genuinely necessary |
| Analytics | Off | First-party article engagement, calculator usage, aggregated product metrics | Explicit opt-in and withdrawal |
| Marketing | Off | LinkedIn Insight Tag, Meta Pixel, X/Reddit/TikTok pixels, server-side conversion APIs | Explicit opt-in and withdrawal |
| Personalization | Off | Non-essential preference-based content or experience | Explicit opt-in and withdrawal |

Do not bundle analytics and marketing consent. “Accept all”, “Reject all” and “Manage preferences” must be equally clear and accessible. No category may be pre-selected. Rejecting optional categories must not impair access to editorial content or calculator functionality.

## 4. Consent record and lifecycle

The future consent record should contain:

- Consent schema version.
- Consent timestamp and expiry.
- Necessary, analytics, marketing and personalization selections.
- Notice/policy version shown.
- Consent mechanism version and locale.
- Withdrawal timestamp and current state, if withdrawn.

Store only what is needed to prove and enforce the user's choice. Do not create a cross-site identity or fingerprint. Consent must be re-requested when the purpose, categories, providers or material processing changes. Withdrawal must immediately stop future optional tracking and remove/disable optional cookies and local identifiers where technically possible.

A persistent footer control must reopen preferences. The user must be able to withdraw as easily as they opted in. Consent storage itself must be strictly necessary for remembering the choice and must not be repurposed for analytics.

## 5. Event architecture

Use a central consent gate and an allowlisted event adapter:

`UI event → consent gate → event schema validator → first-party analytics adapter → optional provider adapters`

The adapter must not fire until the relevant consent category is active. Analytics and marketing adapters must be separate. Provider identifiers must be environment-configured, never embedded as arbitrary CMS content.

### Allowed event names

- `article_view`
- `article_engaged`
- `calculator_used`
- `calculator_result_generated`
- `calculator_result_shared`
- `newsletter_signup`
- `affiliate_click`
- `kit_checkout_started`
- `purchase_completed`
- `contact_submitted`

Event properties must be allowlisted, typed and minimal (for example, article slug, division, calculator ID/version, event outcome, and coarse campaign source). Never send raw calculator inputs, prompts, output text, email addresses, lead details, payment details, user IDs, credentials or free-form strings to analytics.

### Excluded routes and data

Do not emit analytics from admin, CMS, authentication, password reset, email confirmation, unsubscribe, private evidence, private API or account-management routes. Never record private source material, claim/evidence payloads, security incident data, lead contents or user-submitted research.

## 6. Retention and access

- Define separate retention periods for consent records, first-party events, marketing identifiers and operational logs.
- Apply deletion/aggregation controls; do not retain raw event data indefinitely.
- Restrict analytics access by role and audit exports.
- Do not reuse consented marketing data for unrelated purposes.
- Document processor/subprocessor, region, transfer and deletion terms for every provider.
- Ensure data-subject requests can be routed to the actual controller and fulfilled across connected processors.

## 7. Provider integration sequence

1. First-party event schema, server-side validation and retention controls.
2. Consent gate and preference UI with accessible accept/reject/manage controls.
3. First-party analytics adapter and aggregate dashboard.
4. LinkedIn Insight Tag only after marketing consent and approved partner ID.
5. Meta Pixel only after marketing consent and approved pixel ID.
6. X and Reddit adapters only after marketing consent and provider configuration.
7. TikTok and server-side conversion APIs only after a separate privacy/security review, deduplication design and proof that consent is propagated.

No provider ID is currently approved in this specification. No pixel or tracking script should be activated by default.

## 8. Acceptance tests

- Fresh visitor: no optional cookies, storage, pixels, or event requests before choice.
- Accept all: only the selected optional categories activate.
- Reject all: no analytics or marketing adapters load.
- Granular choice: analytics may be on while marketing remains off.
- Withdrawal: optional adapters stop and optional identifiers are cleared/disabled.
- Version change: a material consent-schema or provider change triggers renewed consent.
- Admin/auth/reset/unsubscribe/private evidence: no analytics events.
- Calculator: no inputs or results are sent as event properties.
- Duplicate event: deduplication prevents repeated purchase/conversion counts.
- Invalid event: server rejects unknown names, oversized payloads and unapproved properties.
- Retention: automated deletion/aggregation is testable and evidenced.
- Accessibility: keyboard, screen reader, focus management, contrast and mobile layout pass.

## 9. Release gate

G8 requires a verified data inventory, consent implementation, processor review, event schema, retention/deletion automation, security tests and current legal review for target markets. Until then, the current no-tracking posture must remain in place and the phase must remain pending.
