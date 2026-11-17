import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CalculatorExperience from "./calculator-experience";
import { ArchitectureReviewCTA } from "@/components/ArchitectureReviewCTA";
import { StructuredData } from "@/components/StructuredData";
import { LAB_CALCULATORS } from "@/domain/labs/calculator-suite";

export function generateStaticParams() {
  return LAB_CALCULATORS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const calculator = LAB_CALCULATORS.find((item) => item.slug === slug);
  if (!calculator) return {};
  return {
    title: `${calculator.title} | HEZQEN Labs`,
    description: calculator.description,
    alternates: { canonical: `/labs/${calculator.slug}` },
    openGraph: {
      title: `${calculator.title} | HEZQEN Labs`,
      description: calculator.description,
      type: "website",
      images: [
        {
          url: "/brand/hezqen-og.png",
          width: 1200,
          height: 630,
          alt: `${calculator.title} | HEZQEN Labs`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${calculator.title} | HEZQEN Labs`,
      description: calculator.description,
      images: ["/brand/hezqen-og.png"],
    },
  };
}

export default async function LabCalculatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const calculator = LAB_CALCULATORS.find((item) => item.slug === slug);
  if (!calculator) notFound();
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: calculator.title,
          description: calculator.description,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          url: `https://hezqen.tinlance.com/labs/${calculator.slug}`,
          isAccessibleForFree: true,
          publisher: { "@id": "https://hezqen.tinlance.com/#organization" },
        }}
      />
      <CalculatorExperience key={calculator.slug} calculator={calculator} />
      <ArchitectureReviewCTA calculator={calculator.title} />
    </>
  );
}
