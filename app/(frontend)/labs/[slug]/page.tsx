import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CalculatorExperience from "./calculator-experience";
import { LAB_CALCULATORS } from "@/domain/labs/calculator-suite";

export function generateStaticParams() {
  return LAB_CALCULATORS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const calculator = LAB_CALCULATORS.find((item) => item.slug === slug);
  if (!calculator) return {};
  return {
    title: `${calculator.title} | HEZQEN Labs`,
    description: calculator.description,
    alternates: { canonical: `/labs/${calculator.slug}` },
    openGraph: { title: `${calculator.title} | HEZQEN Labs`, description: calculator.description, type: "website" },
  };
}

export default async function LabCalculatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const calculator = LAB_CALCULATORS.find((item) => item.slug === slug);
  if (!calculator) notFound();
  return <CalculatorExperience calculator={calculator} />;
}
