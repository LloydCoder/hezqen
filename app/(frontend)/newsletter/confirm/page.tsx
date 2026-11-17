import type { Metadata } from "next";

import { NewsletterAction } from "@/components/NewsletterAction";

export const metadata: Metadata = {
  title: "Confirm Your HEZQEN Subscription",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function NewsletterConfirmPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  return (
    <section className="prose-page">
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> HEZQEN / SUBSCRIPTION CONFIRMATION
        </p>
        <h1>
          One last <em>step.</em>
        </h1>
        <p className="prose-lede">
          Confirm that you want to receive The HEZQEN Intelligence Brief. Opening this page does not
          subscribe you; use the button below to record your choice.
        </p>
        <div className="prose-rule" />
        <NewsletterAction action="confirm" token={token ?? ""} />
      </div>
    </section>
  );
}
