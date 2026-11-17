export interface AiCostBreakEvenInput {
  monthlyRequests: number;
  inputTokensPerRequest: number;
  outputTokensPerRequest: number;
  apiInputPricePerMillion: number;
  apiOutputPricePerMillion: number;
  gpuCount: number;
  gpuHourlyCost: number;
  gpuHoursPerMonth: number;
  monthlyInfrastructureOverhead: number;
  monthlyGpuAmortizationCost?: number;
  monthlyEngineeringCost?: number;
  monthlyOnCallCost?: number;
}

export interface AiCostBreakEvenResult {
  apiCostPerRequest: number;
  apiMonthlyCost: number;
  selfHostedMonthlyCost: number;
  monthlySavings: number;
  savingsPercent: number;
  breakEvenMonthlyRequests: number;
  recommendation: "api" | "self_hosted" | "equal_cost";
  assumptions: {
    tokenPriceUnit: "USD per million tokens";
    currency: "USD";
    gpuHoursPerMonth: number;
    infrastructureOverheadIncluded: true;
    gpuPurchaseAmortizationIncluded: true;
    engineeringAndOnCallIncluded: true;
    capacityAndThroughputExcluded: true;
  };
}

function assertFiniteNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite non-negative number`);
  }
}

function assertIntegerInRange(name: string, value: number, min: number, max: number): void {
  assertFiniteNonNegative(name, value);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be an integer between ${min} and ${max}`);
  }
}

export function calculateAiCostBreakEven(input: AiCostBreakEvenInput): AiCostBreakEvenResult {
  assertFiniteNonNegative("monthlyRequests", input.monthlyRequests);
  assertFiniteNonNegative("inputTokensPerRequest", input.inputTokensPerRequest);
  assertFiniteNonNegative("outputTokensPerRequest", input.outputTokensPerRequest);
  assertFiniteNonNegative("apiInputPricePerMillion", input.apiInputPricePerMillion);
  assertFiniteNonNegative("apiOutputPricePerMillion", input.apiOutputPricePerMillion);
  assertIntegerInRange("gpuCount", input.gpuCount, 1, 1024);
  assertFiniteNonNegative("gpuHourlyCost", input.gpuHourlyCost);
  assertIntegerInRange("gpuHoursPerMonth", input.gpuHoursPerMonth, 1, 744);
  assertFiniteNonNegative("monthlyInfrastructureOverhead", input.monthlyInfrastructureOverhead);
  const monthlyGpuAmortizationCost = input.monthlyGpuAmortizationCost ?? 0;
  assertFiniteNonNegative("monthlyGpuAmortizationCost", monthlyGpuAmortizationCost);
  const monthlyEngineeringCost = input.monthlyEngineeringCost ?? 0;
  const monthlyOnCallCost = input.monthlyOnCallCost ?? 0;
  assertFiniteNonNegative("monthlyEngineeringCost", monthlyEngineeringCost);
  assertFiniteNonNegative("monthlyOnCallCost", monthlyOnCallCost);

  const apiCostPerRequest =
    (input.inputTokensPerRequest * input.apiInputPricePerMillion +
      input.outputTokensPerRequest * input.apiOutputPricePerMillion) /
    1_000_000;
  const apiMonthlyCost = apiCostPerRequest * input.monthlyRequests;
  const selfHostedMonthlyCost =
    input.gpuCount * input.gpuHourlyCost * input.gpuHoursPerMonth +
    input.monthlyInfrastructureOverhead +
    monthlyGpuAmortizationCost +
    monthlyEngineeringCost +
    monthlyOnCallCost;
  const monthlySavings = apiMonthlyCost - selfHostedMonthlyCost;
  const savingsPercent = apiMonthlyCost === 0 ? 0 : (monthlySavings / apiMonthlyCost) * 100;
  const breakEvenMonthlyRequests =
    apiCostPerRequest === 0
      ? Number.POSITIVE_INFINITY
      : Math.ceil(selfHostedMonthlyCost / apiCostPerRequest);

  let recommendation: AiCostBreakEvenResult["recommendation"] = "equal_cost";
  if (apiMonthlyCost > selfHostedMonthlyCost) recommendation = "self_hosted";
  if (apiMonthlyCost < selfHostedMonthlyCost) recommendation = "api";

  return {
    apiCostPerRequest,
    apiMonthlyCost,
    selfHostedMonthlyCost,
    monthlySavings,
    savingsPercent,
    breakEvenMonthlyRequests,
    recommendation,
    assumptions: {
      tokenPriceUnit: "USD per million tokens",
      currency: "USD",
      gpuHoursPerMonth: input.gpuHoursPerMonth,
      infrastructureOverheadIncluded: true,
      gpuPurchaseAmortizationIncluded: true,
      engineeringAndOnCallIncluded: true,
      capacityAndThroughputExcluded: true,
    },
  };
}
