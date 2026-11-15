import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { site } from "@/lib/site";
import { StructuredData, publisherGraph } from "@/components/StructuredData";
import { MobileNavigation } from "@/components/MobileNavigation";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "HEZQEN — Global Technology & Business Intelligence",
    template: "%s | HEZQEN",
  },
  description: site.description,
  applicationName: site.name,
  robots:
    process.env.VERCEL_ENV === "preview"
      ? { index: false, follow: false, noarchive: true }
      : undefined,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "HEZQEN — Global Technology & Business Intelligence",
    description: site.description,
    url: site.url,
    images: ["/brand/hezqen-open-graph-1200x630.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HEZQEN — Global Technology & Business Intelligence",
    description: site.description,
    images: ["/brand/hezqen-open-graph-1200x630.png"],
  },
  icons: { icon: "/favicon.svg" },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B1B33",
  colorScheme: "light",
};

const navItems = [
  { href: "/articles", label: "Articles" },
  { href: "/divisions/ai-technology", label: "AI & Technology" },
  { href: "/divisions/cybersecurity", label: "Cybersecurity" },
  { href: "/divisions/cloud-engineering", label: "Cloud & Engineering" },
  { href: "/divisions/business-startups", label: "Business & Startups" },
  { href: "/labs", label: "Labs" },
  { href: "/infrastructure", label: "Infrastructure" },
] as const;

const mobileNavItems = [
  ...navItems,
  { href: "/about", label: "About HEZQEN" },
  { href: "/contact", label: "Contact" },
  { href: "/editorial-standards", label: "Editorial standards" },
] as const;

const footerLinks = [
  { href: "/articles", label: "Articles" },
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
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
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
              <MobileNavigation items={mobileNavItems} />
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
