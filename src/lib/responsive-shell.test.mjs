import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

test("mobile navigation exposes a real accessible disclosure and keyboard dismissal", () => {
  const component = read("src/components/MobileNavigation.tsx");
  assert.match(component, /aria-expanded/);
  assert.match(component, /aria-controls/);
  assert.match(component, /aria-label/);
  assert.match(component, /Escape/);
  assert.match(component, /pointerdown/i);
  assert.match(component, /focusin/i);
  assert.match(component, /triggerRef\.current\?\.focus/);
  assert.match(component, /usePathname/);
  assert.match(component, /aria-current/);
});

test("the shared header uses the mobile navigation and preserves all primary destinations", () => {
  const layout = read("app/(frontend)/layout.tsx");
  assert.match(layout, /MobileNavigation/);
  for (const href of [
    "/divisions/ai-technology",
    "/divisions/cybersecurity",
    "/divisions/cloud-engineering",
    "/divisions/business-startups",
    "/labs",
    "/infrastructure",
    "/about",
    "/contact",
    "/editorial-standards",
  ]) {
    assert.ok(layout.includes(href), `Missing mobile navigation destination: ${href}`);
  }
});

test("mobile layout collapses navigation and content without horizontal nav scrolling", () => {
  const css = read("app/(frontend)/globals.css");
  assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.primary-nav\s*\{\s*display:\s*none;/);
  assert.match(css, /\.mobile-navigation\s*\{\s*display:\s*block;/);
  assert.match(css, /\.hero-grid\s*\{\s*grid-template-columns:\s*(?:minmax\(0,\s*)?1fr\)?;/);
  assert.doesNotMatch(css, /\.primary-nav\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /min-height:\s*48px/);
  assert.match(css, /env\(safe-area-inset/);
  assert.match(css, /@media\\s*\\(max-width:\\s*380px\\)[\\s\\S]*?width:\\s*calc\\(100%\\s*-\\s*32px\\)/);
});

test("calculator pages do not introduce nested main landmarks inside the shared layout", () => {
  for (const path of [
    "app/(frontend)/labs/vram/vram-calculator.tsx",
    "app/(frontend)/labs/ai-cost/ai-cost-calculator.tsx",
  ]) {
    assert.doesNotMatch(
      read(path),
      /<main\b/,
      `${path} must use a section or div inside the shared main landmark`,
    );
  }
});

test("calculator grids and result panels reflow on narrow screens", () => {
  const css = read("app/(frontend)/globals.css");
  const calculatorCss = read("app/(frontend)/labs/[slug]/calculator.module.css");
  assert.match(
    css,
    /@media\s*\(max-width:\s*800px\)[\s\S]*?\.vram-layout\s*\{\s*grid-template-columns:\s*1fr;/,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*560px\)[\s\S]*?\.vram-fields\s*\{\s*grid-template-columns:\s*1fr;/,
  );
  assert.match(
    calculatorCss,
    /@media\s*\(max-width:\s*800px\)[\s\S]*?\.layout\s*\{\s*grid-template-columns:\s*1fr;/,
  );
  assert.match(
    calculatorCss,
    /@media\s*\(max-width:\s*560px\)[\s\S]*?\.fields\s*\{\s*grid-template-columns:\s*1fr;/,
  );
});
