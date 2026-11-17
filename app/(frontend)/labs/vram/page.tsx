import type { Metadata } from "next";
import VramCalculator from "./vram-calculator";
import { ArchitectureReviewCTA } from "@/components/ArchitectureReviewCTA";
import { StructuredData } from "@/components/StructuredData";

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
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "HEZQEN Labs LLM VRAM Sizing Calculator",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          url: "https://hezqen.tinlance.com/labs/vram",
          isAccessibleForFree: true,
          softwareVersion: "1.1.0",
          publisher: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <VramCalculator />
      <ArchitectureReviewCTA calculator="LLM VRAM sizing" />
    </>
  );
}
