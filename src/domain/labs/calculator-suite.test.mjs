import assert from "node:assert/strict";
import test from "node:test";
import { calculateLab, LAB_CALCULATORS } from "./calculator-suite.ts";

test("registers exactly the fourteen additional calculators", () => {
  assert.equal(LAB_CALCULATORS.length, 14);
  assert.equal(new Set(LAB_CALCULATORS.map((item) => item.slug)).size, 14);
});

test("calculates replicated RAG vector storage and monthly cost", () => {
  const result = calculateLab("rag-storage", {
    documents: 1000,
    chunksPerDocument: 10,
    dimensions: 1536,
    bytesPerDimension: 4,
    indexOverhead: 0.3,
    replicas: 2,
    metadataMbPerDocument: 1,
    pricePerGbMonth: 0.1,
  });
  assert.equal(result.metrics.find((metric) => metric.label === "Vector payload")?.value, 0.06152);
  assert.ok(
    result.metrics.some(
      (metric) => metric.label === "Estimated index overhead" && metric.value > 0,
    ),
  );
  assert.ok(result.metrics.some((metric) => metric.label === "Monthly storage cost"));
});

test("scores data leakage exposure with controls reducing estimated likelihood", () => {
  const weak = calculateLab("ai-data-risk", {
    records: 100000,
    sensitivity: 5,
    exposure: 5,
    controlMaturity: 1,
    lossPerRecord: 10,
  });
  const strong = calculateLab("ai-data-risk", {
    records: 100000,
    sensitivity: 5,
    exposure: 5,
    controlMaturity: 5,
    lossPerRecord: 10,
  });
  assert.ok(
    weak.metrics.find((metric) => metric.label === "Expected loss")?.value >
      strong.metrics.find((metric) => metric.label === "Expected loss")?.value,
  );
});

test("calculates hardware payback only from positive monthly savings", () => {
  const result = calculateLab("hardware-roi", {
    purchaseCost: 5000,
    powerKw: 1,
    hoursPerMonth: 300,
    electricityRate: 0.2,
    cloudBaseline: 1000,
    maintenance: 100,
  });
  assert.ok(result.metrics.find((metric) => metric.label === "Payback period")?.value > 0);
});

test("compares fine-tuning and RAG total cost without claiming quality equivalence", () => {
  const result = calculateLab("finetune-vs-rag", {
    preparationCost: 1000,
    trainingHours: 20,
    trainingRate: 5,
    monthlyFineTuneInference: 100,
    indexingCost: 100,
    monthlyRagInference: 80,
    monthlyRetrievalCost: 30,
    months: 12,
    fineTuneLatencyMs: 150,
    ragLatencyMs: 250,
  });
  assert.ok(result.metrics.some((metric) => metric.label === "Fine-tuning total"));
  assert.ok(result.metrics.some((metric) => metric.label === "RAG total"));
});

test("calculates migration payback and rejects a migration with no savings", () => {
  const result = calculateLab("cloud-migration", {
    discovery: 1000,
    refactor: 2000,
    transfer: 500,
    training: 500,
    dualRun: 500,
    currentMonthly: 1000,
    targetMonthly: 700,
  });
  assert.equal(
    result.metrics.find((metric) => metric.label === "Payback period")?.value,
    58.333333333333336,
  );
  assert.throws(
    () =>
      calculateLab("cloud-migration", {
        discovery: 0,
        refactor: 0,
        transfer: 0,
        training: 0,
        dualRun: 0,
        currentMonthly: 500,
        targetMonthly: 600,
      }),
    /no positive monthly savings/i,
  );
});

test("calculates Kubernetes monthly infrastructure spend", () => {
  const result = calculateLab("kubernetes-cost", {
    nodeCount: 3,
    nodeHourly: 0.2,
    hours: 730,
    controlPlane: 70,
    storageGb: 500,
    storageRate: 0.1,
    loadBalancers: 2,
    loadBalancerRate: 20,
    egressGb: 1000,
    egressRate: 0.05,
  });
  assert.equal(
    result.metrics.find((metric) => metric.label === "Monthly total")?.value,
    3 * 0.2 * 730 + 70 + 50 + 40 + 50,
  );
});

test("estimates database capacity including indexes, growth and replicas", () => {
  const result = calculateLab("database-capacity", {
    rows: 1000000,
    rowBytes: 1200,
    indexOverhead: 0.4,
    monthlyGrowth: 0.1,
    months: 12,
    replicas: 2,
  });
  assert.ok(result.metrics.find((metric) => metric.label === "Projected storage")?.value > 0);
});

test("compares three API price schedules using the same token workload", () => {
  const result = calculateLab("api-pricing", {
    inputTokens: 10000000,
    outputTokens: 2000000,
    aInput: 1,
    aOutput: 4,
    bInput: 2,
    bOutput: 8,
    cInput: 0.5,
    cOutput: 5,
  });
  assert.equal(result.metrics.find((metric) => metric.label === "Option C")?.value, 15);
});

test("estimates inference throughput with utilization and workload demand", () => {
  const result = calculateLab("inference-throughput", {
    gpuCount: 4,
    tokensPerSecondPerGpu: 80,
    utilization: 0.7,
    tokensPerRequest: 800,
    targetRequestsPerSecond: 1,
  });
  assert.equal(
    result.metrics.find((metric) => metric.label === "Estimated requests/second")?.value,
    0.28,
  );
  assert.equal(result.metrics.find((metric) => metric.label === "Meets target")?.value, 0);
});

test("estimates incident cost from downtime and response components", () => {
  const result = calculateLab("incident-cost", {
    downtimeHours: 8,
    revenuePerHour: 10000,
    responseCost: 20000,
    legalCost: 5000,
    affectedRecords: 10000,
    notificationCostPerRecord: 0.5,
    otherCost: 1000,
  });
  assert.equal(
    result.metrics.find((metric) => metric.label === "Total incident cost")?.value,
    111000,
  );
});

test("calculates SaaS gross margin after infrastructure, AI and payment fees", () => {
  const result = calculateLab("saas-margin", {
    mrr: 50000,
    infrastructure: 5000,
    ai: 3000,
    paymentRate: 0.03,
    support: 2000,
  });
  assert.equal(result.metrics.find((metric) => metric.label === "Gross margin")?.value, 0.77);
});

test("calculates facility energy using PUE and monthly operating hours", () => {
  const result = calculateLab("datacenter-energy", {
    itLoadKw: 100,
    pue: 1.4,
    hours: 730,
    electricityRate: 0.12,
  });
  assert.equal(
    result.metrics.find((metric) => metric.label === "Monthly energy cost")?.value,
    100 * 1.4 * 730 * 0.12,
  );
});

test("projects storage growth over a retention window with replication", () => {
  const result = calculateLab("storage-growth", {
    initialGb: 1000,
    monthlyGrowthRate: 0.1,
    months: 12,
    replicas: 2,
    pricePerGbMonth: 0.02,
  });
  assert.ok(result.metrics.find((metric) => metric.label === "Retained capacity")?.value > 2000);
});

test("calculates AI agent operating costs from model tokens, tools and platform overhead", () => {
  const result = calculateLab("agent-cost", {
    runs: 10000,
    stepsPerRun: 5,
    inputTokensPerStep: 500,
    outputTokensPerStep: 200,
    inputPricePerMillion: 1,
    outputPricePerMillion: 4,
    toolCostPerRun: 0.01,
    monthlyPlatformCost: 200,
  });
  assert.equal(
    result.metrics.find((metric) => metric.label === "Monthly total")?.value,
    10000 * 5 * ((500 * 1 + 200 * 4) / 1_000_000) + 100 + 200,
  );
});

test("rejects unknown calculators and negative, non-finite or out-of-range inputs", () => {
  assert.throws(() => calculateLab("not-a-calculator", {}), /Unknown calculator/);
  assert.throws(
    () =>
      calculateLab("rag-storage", {
        documents: -1,
        chunksPerDocument: 1,
        dimensions: 1,
        bytesPerDimension: 4,
        replicas: 1,
        metadataMbPerDocument: 0,
        pricePerGbMonth: 1,
      }),
    /documents/,
  );
  assert.throws(
    () =>
      calculateLab("ai-data-risk", {
        records: 1,
        sensitivity: 9,
        exposure: 1,
        controlMaturity: 1,
        lossPerRecord: 1,
      }),
    /sensitivity/,
  );
  assert.throws(
    () =>
      calculateLab("kubernetes-cost", {
        nodeCount: 1.5,
        nodeHourly: 1,
        hours: 1,
        controlPlane: 0,
        storageGb: 0,
        storageRate: 0,
        loadBalancers: 0,
        loadBalancerRate: 0,
        egressGb: 0,
        egressRate: 0,
      }),
    /whole number/,
  );
});
