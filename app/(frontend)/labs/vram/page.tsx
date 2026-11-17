import type { Metadata } from "next";
import VramCalculator from "./vram-calculator";
import { ArchitectureReviewCTA } from "@/components/ArchitectureReviewCTA";

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
    images: [
      {
        url: "/brand/hezqen-og.png",
        width: 1200,
        height: 630,
        alt: "HEZQEN Labs VRAM calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LLM VRAM Sizing Calculator | HEZQEN Labs",
    description: "Estimate model weights, KV cache and runtime headroom for LLM deployment.",
    images: ["/brand/hezqen-og.png"],
  },
};

export default function VramCalculatorPage() {
  return (
    <>
      <VramCalculator />
      <ArchitectureReviewCTA calculator="LLM VRAM sizing" />
    </>
  );
}
