import assert from "node:assert/strict";
import test from "node:test";
import { calculateAiCostBreakEven } from "./ai-cost.ts";

const baseline = {
  monthlyRequests: 100_000,
  inputTokensPerRequest: 1_000,
  outputTokensPerRequest: 500,
  apiInputPricePerMillion: 2,
  apiOutputPricePerMillion: 8,
  gpuCount: 1,
  gpuHourlyCost: 0.5,
  gpuHoursPerMonth: 730,
  monthlyInfrastructureOverhead: 100,
};

test("calculates monthly API spend from input and output token pricing", () => {
  const result = calculateAiCostBreakEven(baseline);
  assert.equal(result.apiMonthlyCost, 100_000 * ((1_000 * 2 + 500 * 8) / 1_000_000));
});

test("calculates self-hosted fixed monthly cost from GPU hours and overhead", () => {
  const result = calculateAiCostBreakEven(baseline);
  assert.equal(result.selfHostedMonthlyCost, 1 * 0.5 * 730 + 100);
});

test("reports self-hosted savings and percentage when it is cheaper", () => {
  const result = calculateAiCostBreakEven(baseline);
  assert.equal(result.monthlySavings, result.apiMonthlyCost - result.selfHostedMonthlyCost);
  assert.equal(result.recommendation, "self_hosted");
  assert.ok(result.savingsPercent > 0);
});

test("calculates break-even request volume from fixed cost and per-request API spend", () => {
  const result = calculateAiCostBreakEven(baseline);
  assert.equal(
    result.breakEvenMonthlyRequests,
    Math.ceil(result.selfHostedMonthlyCost / result.apiCostPerRequest),
  );
});

test("recommends API when self-hosting costs more at the supplied workload", () => {
  const result = calculateAiCostBreakEven({
    ...baseline,
    monthlyRequests: 1_000,
    gpuHourlyCost: 10,
  });
  assert.equal(result.recommendation, "api");
  assert.ok(result.monthlySavings < 0);
});

test("handles zero workload without division by zero", () => {
  const result = calculateAiCostBreakEven({ ...baseline, monthlyRequests: 0 });
  assert.equal(result.apiMonthlyCost, 0);
  assert.equal(result.monthlySavings, -result.selfHostedMonthlyCost);
  assert.equal(
    result.breakEvenMonthlyRequests,
    Math.ceil(result.selfHostedMonthlyCost / result.apiCostPerRequest),
  );
});

test("rejects negative or non-finite cost and workload inputs", () => {
  assert.throws(() => calculateAiCostBreakEven({ ...baseline, monthlyRequests: -1 }), RangeError);
  assert.throws(
    () => calculateAiCostBreakEven({ ...baseline, gpuHourlyCost: Number.NaN }),
    RangeError,
  );
  assert.throws(
    () => calculateAiCostBreakEven({ ...baseline, apiInputPricePerMillion: -0.1 }),
    RangeError,
  );
});

test("rejects fractional GPU counts and invalid monthly GPU hours", () => {
  assert.throws(() => calculateAiCostBreakEven({ ...baseline, gpuCount: 1.5 }), RangeError);
  assert.throws(() => calculateAiCostBreakEven({ ...baseline, gpuHoursPerMonth: 800 }), RangeError);
});

test("includes engineering and on-call costs in the self-hosted monthly total", () => {
  const result = calculateAiCostBreakEven({
    ...baseline,
    monthlyEngineeringCost: 800,
    monthlyOnCallCost: 300,
  });
  assert.equal(result.selfHostedMonthlyCost, 1 * 0.5 * 730 + 100 + 800 + 300);
});

test("rejects negative engineering and on-call cost assumptions", () => {
  assert.throws(
    () => calculateAiCostBreakEven({ ...baseline, monthlyEngineeringCost: -1 }),
    RangeError,
  );
  assert.throws(() => calculateAiCostBreakEven({ ...baseline, monthlyOnCallCost: -1 }), RangeError);
});
