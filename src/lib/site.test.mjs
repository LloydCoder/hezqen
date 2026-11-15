import assert from "node:assert/strict";
import test from "node:test";
import { divisions, getDivision } from "./site.ts";

test("defines the four approved editorial divisions", () => {
  assert.deepEqual(
    divisions.map((division) => division.name),
    ["AI & Technology", "Cybersecurity", "Cloud & Engineering", "Business & Startups"],
  );
});

test("uses unique stable slugs", () => {
  const slugs = divisions.map((division) => division.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("returns a division by its canonical slug", () => {
  assert.equal(getDivision("cybersecurity")?.name, "Cybersecurity");
});

test("returns undefined for an unknown division", () => {
  assert.equal(getDivision("not-a-division"), undefined);
});
