"use client";

import { useMemo, useState } from "react";
import { calculateAiCostBreakEven } from "@/domain/labs/ai-cost";

const defaults = {
  monthlyRequests: "100000",
  inputTokensPerRequest: "1000",
  outputTokensPerRequest: "500",
  apiInputPricePerMillion: "2",
  apiOutputPricePerMillion: "8",
  gpuCount: "1",
  gpuHourlyCost: "1.5",
  gpuHoursPerMonth: "730",
  monthlyInfrastructureOverhead: "100",
  monthlyGpuAmortizationCost: "0",
  monthlyEngineeringCost: "0",
  monthlyOnCallCost: "0",
};

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="vram-field">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export default function AiCostCalculator() {
  const [values, setValues] = useState(defaults);
  const update = (key: keyof typeof defaults) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => {
    try {
      return {
        value: calculateAiCostBreakEven({
          monthlyRequests: Number(values.monthlyRequests),
          inputTokensPerRequest: Number(values.inputTokensPerRequest),
          outputTokensPerRequest: Number(values.outputTokensPerRequest),
          apiInputPricePerMillion: Number(values.apiInputPricePerMillion),
          apiOutputPricePerMillion: Number(values.apiOutputPricePerMillion),
          gpuCount: Number(values.gpuCount),
          gpuHourlyCost: Number(values.gpuHourlyCost),
          gpuHoursPerMonth: Number(values.gpuHoursPerMonth),
          monthlyInfrastructureOverhead: Number(values.monthlyInfrastructureOverhead),
          monthlyGpuAmortizationCost: Number(values.monthlyGpuAmortizationCost),
          monthlyEngineeringCost: Number(values.monthlyEngineeringCost),
          monthlyOnCallCost: Number(values.monthlyOnCallCost),
        }),
        error: null,
      };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : "Invalid calculator input.",
      };
    }
  }, [values]);

  const money = (amount: number) =>
    amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  const number = (amount: number) =>
    Number.isFinite(amount) ? Math.ceil(amount).toLocaleString("en-US") : "Not reached";

  return (
    <section className="vram-page">
      <div className="container">
        <a className="back-link" href="/">
          ← HEZQEN home
        </a>
        <p className="eyebrow">
          <span className="eyebrow-line" /> HEZQEN LABS / AI INFRASTRUCTURE ECONOMICS
        </p>
        <h1>
          API vs self-hosted <em>AI cost calculator</em>
        </h1>
        <p className="vram-lede">
          Compare token-based API spend with a fixed monthly GPU deployment. Adjust workload,
          provider pricing and infrastructure assumptions to estimate a cost break-even point.
        </p>

        <div className="vram-layout">
          <section className="vram-panel" aria-labelledby="ai-cost-input-heading">
            <div className="vram-panel-heading">
              <p className="section-label">WORKLOAD AND COST ASSUMPTIONS</p>
              <h2 id="ai-cost-input-heading">Monthly usage</h2>
            </div>
            <div className="vram-fields">
              <NumberField
                label="Requests per month"
                value={values.monthlyRequests}
                onChange={update("monthlyRequests")}
              />
              <NumberField
                label="Input tokens per request"
                value={values.inputTokensPerRequest}
                onChange={update("inputTokensPerRequest")}
              />
              <NumberField
                label="Output tokens per request"
                value={values.outputTokensPerRequest}
                onChange={update("outputTokensPerRequest")}
              />
              <NumberField
                label="API input price (USD / 1M tokens)"
                value={values.apiInputPricePerMillion}
                onChange={update("apiInputPricePerMillion")}
                step={0.01}
              />
              <NumberField
                label="API output price (USD / 1M tokens)"
                value={values.apiOutputPricePerMillion}
                onChange={update("apiOutputPricePerMillion")}
                step={0.01}
              />
              <NumberField
                label="GPU count"
                value={values.gpuCount}
                onChange={update("gpuCount")}
              />
              <NumberField
                label="GPU cost per hour (USD)"
                value={values.gpuHourlyCost}
                onChange={update("gpuHourlyCost")}
                step={0.01}
              />
              <NumberField
                label="GPU hours per month"
                value={values.gpuHoursPerMonth}
                onChange={update("gpuHoursPerMonth")}
              />
              <NumberField
                label="Other monthly infrastructure (USD)"
                value={values.monthlyInfrastructureOverhead}
                onChange={update("monthlyInfrastructureOverhead")}
                step={0.01}
              />
              <NumberField
                label="Monthly GPU purchase amortization (USD, if owned)"
                value={values.monthlyGpuAmortizationCost}
                onChange={update("monthlyGpuAmortizationCost")}
                step={0.01}
              />
              <NumberField
                label="Monthly engineering labour (USD)"
                value={values.monthlyEngineeringCost}
                onChange={update("monthlyEngineeringCost")}
                step={0.01}
              />
              <NumberField
                label="Monthly on-call and operations (USD)"
                value={values.monthlyOnCallCost}
                onChange={update("monthlyOnCallCost")}
                step={0.01}
              />
            </div>
            <p className="vram-footnote">
              Uses the prices you enter; it does not assume a particular API vendor or GPU provider. For rented GPUs, use the hourly rate and leave purchase amortization at zero. For owned GPUs, enter monthly amortization and set rental cost to zero.
            </p>
          </section>

          <section
            className="vram-results"
            aria-live="polite"
            aria-labelledby="ai-cost-results-heading"
          >
            <p className="section-label">MONTHLY COST COMPARISON</p>
            <h2 id="ai-cost-results-heading">Estimated economics</h2>
            {result.error ? (
              <p className="vram-error" role="alert">
                {result.error}
              </p>
            ) : result.value ? (
              <>
                <p className="vram-total">{money(result.value.monthlySavings)}</p>
                <p className="vram-result-caption">
                  {result.value.recommendation === "self_hosted"
                    ? "Estimated monthly savings from self-hosting"
                    : result.value.recommendation === "api"
                      ? "Estimated additional cost of self-hosting"
                      : "Estimated monthly cost parity"}
                </p>
                <dl className="vram-breakdown">
                  <div>
                    <dt>API monthly spend</dt>
                    <dd>{money(result.value.apiMonthlyCost)}</dd>
                  </div>
                  <div>
                    <dt>Self-hosted monthly cost</dt>
                    <dd>{money(result.value.selfHostedMonthlyCost)}</dd>
                  </div>
                  <div>
                    <dt>API cost per request</dt>
                    <dd>{money(result.value.apiCostPerRequest)}</dd>
                  </div>
                  <div>
                    <dt>Break-even monthly requests</dt>
                    <dd>{number(result.value.breakEvenMonthlyRequests)}</dd>
                  </div>
                  <div>
                    <dt>Difference vs API spend</dt>
                    <dd>{result.value.savingsPercent.toFixed(1)}%</dd>
                  </div>
                </dl>
                <p className="vram-footnote">
                  {result.value.recommendation === "self_hosted"
                    ? "At this workload, the modeled self-hosted monthly cost is lower than API spend."
                    : "At this workload, the modeled API spend is no higher than the self-hosted monthly cost."}
                </p>
              </>
            ) : null}
          </section>
        </div>

        <section className="vram-methodology">
          <p className="section-label">METHODOLOGY AND LIMITATIONS</p>
          <h2>What this estimate includes</h2>
          <p>
            API cost is calculated from input and output token volume multiplied by the prices
            supplied. Self-hosted cost is GPU count × hourly GPU cost × monthly GPU hours, plus the
            additional monthly infrastructure overhead, engineering labour and on-call/operations
            costs entered above.
          </p>
          <p>
            This is a cost-only break-even model, not a capacity or deployment recommendation. It
            includes the engineering and on-call cost inputs above, but excludes model quality
            differences, utilization inefficiency, autoscaling, networking, storage beyond the
            overhead input, redundancy, taxes, discounts, minimum commitments and workload-specific
            throughput constraints. Confirm that the selected hardware can serve the workload before
            using the result for a purchasing decision.
          </p>
        </section>
      </div>
    </section>
  );
}
