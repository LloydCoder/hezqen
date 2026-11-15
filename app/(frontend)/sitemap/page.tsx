import type { Metadata } from "next";
import Link from "next/link";
import { divisions } from "@/lib/site";
import { LAB_CALCULATORS } from "@/domain/labs/calculator-suite";

export const metadata: Metadata = {
  title: "HTML Sitemap",
  description: "Browse the main sections, editorial divisions, engineering tools and public policies on HEZQEN.",
  alternates: { canonical: "/sitemap" },
};

export default function HtmlSitemapPage() {
  return (
    <section className="prose-page">
      <div className="container prose-container">
        <p className="eyebrow"><span className="eyebrow-line" /> SITE DIRECTORY</p>
        <h1>Explore <em>HEZQEN.</em></h1>
        <p className="prose-lede">A directory of the public sections and resources currently available on this site.</p>
        <div className="prose-rule" />
        <h2>Publication</h2>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/about">About HEZQEN</Link></li>
          <li><Link href="/editorial-standards">Editorial standards</Link></li>
          <li><Link href="/corrections">Corrections policy</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        <h2>Editorial divisions</h2>
        <ul>{divisions.map((division) => <li key={division.slug}><Link href={`/divisions/${division.slug}`}>{division.name}</Link></li>)}</ul>
        <h2>Labs and engineering tools</h2>
        <ul>
          <li><Link href="/labs">All HEZQEN Labs calculators</Link></li>
          <li><Link href="/labs/vram">LLM VRAM sizing calculator</Link></li>
          <li><Link href="/labs/ai-cost">AI API vs self-hosted cost calculator</Link></li>
          {LAB_CALCULATORS.map((calculator) => <li key={calculator.slug}><Link href={`/labs/${calculator.slug}`}>{calculator.title}</Link></li>)}
          <li><Link href="/infrastructure">HEZQEN Infrastructure kits</Link></li>
        </ul>
        <h2>Policies and trust</h2>
        <ul>
          <li><Link href="/security">Security and responsible disclosure</Link></li>
          <li><Link href="/privacy">Privacy notice</Link></li>
          <li><Link href="/cookies">Cookie notice</Link></li>
          <li><Link href="/terms">Terms of use</Link></li>
        </ul>
        <h2>Machine-readable discovery</h2>
        <ul>
          <li><a href="/robots.txt">robots.txt</a></li>
          <li><a href="/sitemap.xml">XML sitemap</a></li>
          <li><a href="/llms.txt">llms.txt</a></li>
          <li><a href="/llms-full.txt">llms-full.txt</a></li>
        </ul>
      </div>
    </section>
  );
}
