"use client";

import { useMemo, useState } from "react";
import styles from "./calculator.module.css";
import { calculateLab, type LabCalculator } from "@/domain/labs/calculator-suite";

function formatMetric(value: number, unit: string): string {
  if (unit === "USD") return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
  if (unit === "fraction") return `${(value * 100).toFixed(1)}%`;
  if (unit === "boolean") return value === 1 ? "Yes" : "No";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value)} ${unit}`.trim();
}

export default function CalculatorExperience({ calculator }: { calculator: LabCalculator }) {
  const [values, setValues] = useState<Record<string, number>>(
    () => Object.fromEntries(calculator.fields.map((item) => [item.key, item.defaultValue])),
  );
  const result = useMemo(() => {
    try {
      return { calculation: calculateLab(calculator.slug, values), error: null };
    } catch (error) {
      return { calculation: null, error: error instanceof Error ? error.message : "Unable to calculate these inputs." };
    }
  }, [calculator.slug, values]);

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <a className={styles.back} href="/labs">← All HEZQEN Labs</a>
        <p className={styles.kicker}>HEZQEN LABS / {calculator.category.toUpperCase()}</p>
        <h1>{calculator.title}</h1>
        <p className={styles.intro}>{calculator.description}</p>
        <div className={styles.layout}>
          <section className={styles.panel} aria-labelledby="inputs-title">
            <div className={styles.panelHead}>
              <p className={styles.label}>CONFIGURATION</p>
              <h2 id="inputs-title">Your assumptions</h2>
            </div>
            <div className={styles.fields}>
              {calculator.fields.map((item) => (
                <label className={styles.field} key={item.key}>
                  <span>{item.label}</span>
                  <div className={styles.inputWrap}>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      value={Number.isNaN(values[item.key]) ? "" : values[item.key]}
                      onChange={(event) => setValues((current) => ({
                        ...current,
                        [item.key]: event.target.value === "" ? Number.NaN : Number(event.target.value),
                      }))}
                      aria-describedby={item.help ? `${item.key}-help` : undefined}
                    />
                    {item.unit && <small>{item.unit}</small>}
                  </div>
                  {item.help && <small id={`${item.key}-help`} className={styles.help}>{item.help}</small>}
                </label>
              ))}
            </div>
            <button className={styles.reset} type="button" onClick={() => setValues(Object.fromEntries(calculator.fields.map((item) => [item.key, item.defaultValue])))}>Reset illustrative inputs</button>
          </section>
          <section className={styles.results} aria-live="polite" aria-labelledby="results-title">
            <p className={styles.label}>MODEL OUTPUT</p>
            <h2 id="results-title">Your estimate</h2>
            {result.error ? (
              <p className={styles.error} role="alert">{result.error}</p>
            ) : (
              <>
                <div className={styles.metrics}>
                  {result.calculation?.metrics.map((item) => (
                    <article className={styles.metric} key={item.label}>
                      <span>{item.label}</span>
                      <strong>{formatMetric(item.value, item.unit)}</strong>
                    </article>
                  ))}
                </div>
                <p className={styles.caveat}>{result.calculation?.caveat}</p>
              </>
            )}
            <p className={styles.disclaimer}>All starting values are illustrative, not HEZQEN recommendations or provider quotes. Replace them with current, workload-specific inputs before making a purchasing, architecture, compliance or investment decision.</p>
          </section>
        </div>
        <p className={styles.method}>Methodology: deterministic arithmetic over the values shown. No external provider prices, benchmark measurements, legal assessments or hidden data are fetched by this calculator.</p>
      </div>
    </div>
  );
}
