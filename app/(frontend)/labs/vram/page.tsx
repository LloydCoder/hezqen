import type { Metadata } from "next";
import VramCalculator from "./vram-calculator";

export const metadata: Metadata = {
  title: "LLM VRAM Sizing Calculator | HEZQEN Labs",
  description:
    "Estimate LLM model-weight memory, KV cache and runtime headroom with HEZQEN Labs' transparent GPU VRAM sizing calculator.",
  alternates: {
    canonical: "/labs/vram",
  },
  openGraph: {
    title: "LLM VRAM Sizing Calculator | HEZQEN Labs",
    description:
      "A transparent first-pass estimate of model weights, KV cache and runtime headroom.",
    type: "website",
  },
};

export default function VramCalculatorPage() {
  return <VramCalculator />;
}
