import type { Metadata } from "next";
import AiCostCalculator from "./ai-cost-calculator";
import { ArchitectureReviewCTA } from "@/components/ArchitectureReviewCTA";

export const metadata: Metadata = {
  title: "API vs Self-Hosted AI Cost Calculator | HEZQEN Labs",
  description:
    "Compare token-based AI API spend with self-hosted GPU costs using a transparent monthly break-even model.",
  alternates: {
    canonical: "/labs/ai-cost",
  },
  openGraph: {
    title: "API vs Self-Hosted AI Cost Calculator | HEZQEN Labs",
    description: "Model monthly AI API and self-hosted GPU costs with explicit assumptions.",
    type: "website",
    images: [
      {
        url: "/brand/hezqen-og.png",
        width: 1200,
        height: 630,
        alt: "HEZQEN Labs AI cost calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "API vs Self-Hosted AI Cost Calculator | HEZQEN Labs",
    description: "Compare AI API spend with self-hosted GPU, infrastructure and operating costs.",
    images: ["/brand/hezqen-og.png"],
  },
};

export default function AiCostCalculatorPage() {
  return (
    <>
      <AiCostCalculator />
      <ArchitectureReviewCTA calculator="API vs self-hosted AI economics" />
    </>
  );
}
