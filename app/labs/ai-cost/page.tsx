import type { Metadata } from "next";
import AiCostCalculator from "./ai-cost-calculator";

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
  },
};

export default function AiCostCalculatorPage() {
  return <AiCostCalculator />;
}
