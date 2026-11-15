import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { site } from "@/lib/site";
import { StructuredData, publisherGraph } from "@/components/StructuredData";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "HEZQEN — Global Technology & Business Intelligence",
    template: "%s | HEZQEN",
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "HEZQEN — Global Technology & Business Intelligence",
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "HEZQEN — Global Technology & Business Intelligence",
    description: site.description,
  },
  icons: { icon: "/favicon.svg" },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1B33",
  colorScheme: "light",
};

const navItems = [
  { href: "/divisions/ai-technology", label: "AI & Technology" },
  { href: "/divisions/cybersecurity", label: "Cybersecurity" },
  { href: "/divisions/cloud-engineering", label: "Cloud & Engineering" },
  { href: "/divisions/business-startups", label: "Business & Startups" },
  { href: "/labs", label: "Labs" },
  { href: "/infrastructure", label: "Infrastructure" },
] as const;

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/editorial-standards", label: "Editorial standards" },
  { href: "/corrections", label: "Corrections" },
  { href: "/contact", label: "Contact" },
  { href: "/security", label: "Security" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/terms", label: "Terms" },
  { href: "/sitemap", label: "HTML sitemap" },
  { href: "/labs", label: "Labs" },
  { href: "/infrastructure", label: "Infrastructure" },
] as const;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StructuredData data={publisherGraph} />
        <div className="site-shell">
          <div className="topline">
            <div className="container topline-inner">
              <span>A TINLANCE COMPANY</span>
              <span>{site.positioning}</span>
            </div>
          </div>
          <header className="site-header">
            <div className="container header-inner">
              <Link href="/" className="brand-link" aria-label="HEZQEN home">
                <Image
                  className="brand-logo"
                  src="/brand/hezqen-horizontal-color.svg"
                  alt="HEZQEN"
                  width={186}
                  height={60}
                  unoptimized
                  priority
                />
              </Link>
              <nav className="primary-nav" aria-label="Primary navigation">
                {navItems.map((item) => (
                  <Link href={item.href} key={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link className="header-link" href="/about">
                About HEZQEN <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </header>
          <main id="main-content">{children}</main>
          <footer className="site-footer">
            <div className="container footer-main">
              <div className="footer-brand">
                <Image
                  src="/brand/hezqen-horizontal-reversed.svg"
                  alt="HEZQEN"
                  width={186}
                  height={60}
                  unoptimized
                />
                <p>Research. Intelligence. Perspective.</p>
              </div>
              <nav className="footer-links" aria-label="Footer navigation">
                {footerLinks.map((item) => (
                  <Link href={item.href} key={item.href}>
                    {item.label}
                  </Link>
                ))}
                <a href="https://tinlance.com" rel="noopener noreferrer">
                  Tinlance
                </a>
              </nav>
            </div>
            <div className="container footer-bottom">
              <span>© {new Date().getFullYear()} HEZQEN. Published by Tinlance.</span>
              <span>Independent by design. Accountable by principle.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
