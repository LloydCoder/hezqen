import assert from "node:assert/strict";
import test from "node:test";

import { getInfrastructureProduct, infrastructureProducts } from "./infrastructure-products.ts";

test("publishes the five approved infrastructure products in order", () => {
  assert.deepEqual(
    infrastructureProducts.map((product) => product.id),
    ["IK-01", "IK-02", "IK-03", "IK-04", "IK-05"],
  );
});

test("every kit is accurately labeled as an engineering preview", () => {
  for (const product of infrastructureProducts) {
    assert.equal(product.status, "Engineering preview");
    assert.equal(product.license, "Apache-2.0");
    assert.match(product.repositoryUrl, /^https:\/\/github\.com\/LloydCoder\/hezqen-infrastructure-standard/);
  }
});

test("product limitations are explicit and not represented as certifications", () => {
  const descriptions = infrastructureProducts.map((product) => product.limitations).join(" ");
  assert.match(descriptions, /NVIDIA.*physical/i);
  assert.match(descriptions, /not comprehensive PII detection/i);
  assert.match(descriptions, /CPU-only/i);
  assert.match(descriptions, /single-host/i);
  assert.match(descriptions, /transitive.*SBOM/i);
});

test("looks up products by stable ID and returns undefined for unknown IDs", () => {
  assert.equal(getInfrastructureProduct("IK-04")?.slug, "airgapped-rag");
  assert.equal(getInfrastructureProduct("IK-99"), undefined);
});
