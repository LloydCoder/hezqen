import type { Metadata } from "next";

import { NewsletterAction } from "@/components/NewsletterAction";

export const metadata: Metadata = {
  title: "Unsubscribe from HEZQEN",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function NewsletterUnsubscribePage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  return (
    <section className="prose-page">
      <div className="container prose-container">
        <p className="eyebrow">
          <span className="eyebrow-line" /> HEZQEN / SUBSCRIPTION PREFERENCES
        </p>
        <h1>
          Your inbox, <em>your choice.</em>
        </h1>
        <p className="prose-lede">
          Use the button below to unsubscribe from The HEZQEN Intelligence Brief. Opening this page
          does not change your subscription.
        </p>
        <div className="prose-rule" />
        <NewsletterAction action="unsubscribe" token={token ?? ""} />
      </div>
    </section>
  );
}
