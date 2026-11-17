import assert from "node:assert/strict";
import test from "node:test";

import picomatch from "picomatch";

const { isMatch, makeRe } = picomatch;

test("picomatch collapses single-branch repeated extglobs containing a star", () => {
  for (const pattern of ["+(*)", "+(*a)", "*(*a)", "+(a*)", "+(a*b)", "*(*.js)"]) {
    assert.doesNotMatch(
      makeRe(pattern).source,
      /\)[+*]/,
      pattern + " must not nest unbounded quantifiers",
    );
  }

  const hostileInput = "a".repeat(50) + "b";
  for (const pattern of ["+(*a)", "*(*a)", "+(*a)c", "x+(*a)"]) {
    const startedAt = performance.now();
    assert.equal(isMatch(hostileInput, pattern), false);
    assert.ok(
      performance.now() - startedAt < 250,
      pattern + " exceeded the ReDoS regression budget",
    );
  }

  assert.equal(isMatch("abc", "+(*)c"), true);
  assert.equal(isMatch("aaa", "+(*a)"), true);
  assert.equal(isMatch("a.a", "+(*a)"), true);
  assert.equal(isMatch("ab", "+(*a)"), false);
  assert.equal(isMatch("axbayb", "+(a*b)"), true);
  assert.equal(isMatch("axbay", "+(a*b)"), false);
  assert.equal(isMatch("foo.js", "*(*.js)"), true);
  assert.equal(isMatch("foo.ts", "*(*.js)"), false);
});
