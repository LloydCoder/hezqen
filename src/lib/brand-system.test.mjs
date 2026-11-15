import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../../app/(frontend)/globals.css", import.meta.url), "utf8");

test("brand color tokens match the supplied HEZQEN palette", () => {
  for (const token of [
    "--navy: #0b1b33",
    "--graphite: #2a3441",
    "--amber: #f5a623",
    "--amber-deep: #a35f00",
    "--slate: #5b6678",
    "--mist: #f4f5f7",
    "--white: #ffffff",
  ]) {
    assert.ok(css.includes(token), `Missing brand token: ${token}`);
  }
});

test("all display typography stays within the Inter family", () => {
  assert.match(css, /--sans:\s*Inter,/);
  assert.match(css, /--display:\s*"Inter Display",\s*"Inter"/);
  assert.doesNotMatch(css, /Georgia|Times New Roman|var\(--serif\)|font-family:\s*serif/);
});

test("body typography uses the supplied 17px / 28px scale", () => {
  assert.match(css, /body\s*\{[^}]*font-size:\s*17px;[^}]*line-height:\s*28px;/s);
});

test("editorial labels use the supplied 11px semibold and 20 percent tracking", () => {
  assert.match(
    css,
    /\.eyebrow,\s*\.section-label,\s*\.platform-kicker\s*\{[^}]*font-size:\s*11px;[^}]*font-weight:\s*600;[^}]*letter-spacing:\s*0\.2em;/s,
  );
  const platformKickerRules = [...css.matchAll(/\.platform-kicker\s*\{([^}]*)\}/g)];
  assert.ok(platformKickerRules.length >= 2);
  assert.match(platformKickerRules.at(-1)[1], /font-size:\s*11px;/);
});

test("horizontal logo never drops below the kit minimum screen width", () => {
  const desktop = css.match(/\.brand-logo\s*\{[^}]*width:\s*(\d+)px;/s);
  const mobile = css.match(
    /@media\s*\(max-width:\s*700px\)[\s\S]*?\.brand-logo\s*\{[^}]*width:\s*(\d+)px;/,
  );
  assert.ok(desktop);
  assert.ok(mobile);
  assert.ok(Number(desktop[1]) >= 120);
  assert.ok(Number(mobile[1]) >= 120);
});
