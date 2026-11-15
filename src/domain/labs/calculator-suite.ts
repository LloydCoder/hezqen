export interface CalculatorField {
  key: string;
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  help?: string;
}
export interface LabCalculator {
  slug: string;
  title: string;
  category: string;
  description: string;
  fields: CalculatorField[];
}
export interface LabMetric {
  label: string;
  value: number;
  unit: string;
}
export interface LabCalculation {
  metrics: LabMetric[];
  caveat: string;
}
type Values = Record<string, number>;
const field = (key: string, label: string, defaultValue: number, unit = "", min = 0, max = 1e12, step = 1, help?: string): CalculatorField =>
  ({ key, label, defaultValue, unit, min, max, step, help });
const f = field;
export const LAB_CALCULATORS: LabCalculator[] = [
  { slug: "rag-storage", title: "Local RAG Storage & Vector Database Sizing", category: "Private AI & RAG", description: "Estimate embedding payload, metadata, replication and monthly storage cost for a retrieval corpus.", fields: [
    f("documents","Documents",100000,"documents",1,1e10), f("chunksPerDocument","Chunks per document",8,"chunks",1,1e6), f("dimensions","Embedding dimensions",1536,"dimensions",1,65536), f("bytesPerDimension","Bytes per dimension",4,"bytes",1,16,1,"Use 4 for float32, 2 for float16, or 1 for int8 payload estimates."), f("replicas","Copies including primary",2,"copies",1,20), f("metadataMbPerDocument","Metadata per document",0.02,"MB",0,1e6,0.01), f("pricePerGbMonth","Storage price",0.1,"USD/GB-month",0,1e6,0.01)
  ]},
  { slug: "ai-data-risk", title: "AI Data-Leakage & Compliance Risk Estimator", category: "Business & Cybersecurity Economics", description: "Model a scenario-based expected-loss estimate from data sensitivity, exposure and control maturity.", fields: [
    f("records","Potentially exposed records",10000,"records",0,1e12), f("sensitivity","Data sensitivity",3,"score / 1–5",1,5), f("exposure","Exposure likelihood factor",3,"score / 1–5",1,5), f("controlMaturity","Control maturity",3,"score / 1–5",1,5), f("lossPerRecord","Estimated loss per record",5,"USD / record",0,1e9,0.01)
  ]},
  { slug: "hardware-roi", title: "Local Hardware Rig ROI & Electricity Calculator", category: "AI Infrastructure & GPU Intelligence", description: "Compare an upfront local hardware purchase with the supplied cloud baseline and operating costs.", fields: [
    f("purchaseCost","Hardware purchase cost",6000,"USD",0,1e9,1), f("powerKw","Average wall power",1.2,"kW",0,1e5,0.01), f("hoursPerMonth","Operating hours",300,"hours/month",0,744), f("electricityRate","Electricity tariff",0.15,"USD/kWh",0,1e5,0.001), f("cloudBaseline","Comparable cloud spend",900,"USD/month",0,1e9,1), f("maintenance","Maintenance and other costs",75,"USD/month",0,1e9,1)
  ]},
  { slug: "finetune-vs-rag", title: "Fine-Tuning vs RAG Cost & Latency Model", category: "Private AI & RAG", description: "Compare user-supplied setup, inference and retrieval costs; latency inputs are descriptive, not benchmark claims.", fields: [
    f("preparationCost","Fine-tuning data preparation",1000,"USD",0,1e9), f("trainingHours","Training duration",20,"GPU-hours",0,1e7,0.1), f("trainingRate","Training compute rate",2,"USD/GPU-hour",0,1e6,0.01), f("monthlyFineTuneInference","Fine-tuned inference",150,"USD/month",0,1e9,1), f("indexingCost","Initial RAG indexing",100,"USD",0,1e9), f("monthlyRagInference","RAG generation spend",100,"USD/month",0,1e9,1), f("monthlyRetrievalCost","RAG retrieval spend",30,"USD/month",0,1e9,1), f("months","Evaluation horizon",12,"months",1,120,1), f("fineTuneLatencyMs","Fine-tuned p50 latency",200,"ms",0,1e8,1), f("ragLatencyMs","RAG p50 latency",350,"ms",0,1e8,1)
  ]},
  { slug: "cloud-migration", title: "Cloud Migration Cost Estimator", category: "Cloud & Infrastructure Economics", description: "Estimate one-time migration effort, target run rate and simple payback from supplied costs.", fields: [
    f("discovery","Discovery and assessment",3000,"USD",0,1e9), f("refactor","Refactoring and migration",12000,"USD",0,1e9), f("transfer","Data transfer",1000,"USD",0,1e9), f("training","Team enablement",1500,"USD",0,1e9), f("dualRun","Dual-running period",2500,"USD",0,1e9), f("currentMonthly","Current monthly run rate",3000,"USD/month",0,1e9), f("targetMonthly","Target monthly run rate",2200,"USD/month",0,1e9)
  ]},
  { slug: "kubernetes-cost", title: "Kubernetes Infrastructure Cost Calculator", category: "Cloud & Infrastructure Economics", description: "Sum worker nodes, control plane, persistent storage, load balancers and egress.", fields: [
    f("nodeCount","Worker nodes",3,"nodes",0,100000), f("nodeHourly","Cost per node",0.2,"USD/node-hour",0,1e6,0.001), f("hours","Hours per month",730,"hours",0,744), f("controlPlane","Control plane",70,"USD/month",0,1e8), f("storageGb","Persistent storage",500,"GB",0,1e12), f("storageRate","Storage rate",0.1,"USD/GB-month",0,1e6,0.001), f("loadBalancers","Load balancers",2,"count",0,100000), f("loadBalancerRate","Price per load balancer",20,"USD/month",0,1e6), f("egressGb","Network egress",1000,"GB",0,1e12), f("egressRate","Egress rate",0.05,"USD/GB",0,1e6,0.001)
  ]},
  { slug: "database-capacity", title: "Database Capacity Planner", category: "Cloud & Infrastructure Economics", description: "Project base table size, index overhead, compounding growth and replica footprint.", fields: [
    f("rows","Current row count",1000000,"rows",0,1e13), f("rowBytes","Average row size",1200,"bytes",1,1e9), f("indexOverhead","Index overhead factor",0.4,"fraction of table size",0,10,0.01), f("monthlyGrowth","Monthly row growth",0.1,"fraction",0,5,0.01), f("months","Forecast horizon",12,"months",0,120,1), f("replicas","Copies including primary",2,"copies",1,20)
  ]},
  { slug: "api-pricing", title: "AI API Pricing Comparison Engine", category: "AI Infrastructure & GPU Intelligence", description: "Compare three user-entered provider price schedules against one input/output token workload.", fields: [
    f("inputTokens","Input tokens",10000000,"tokens",0,1e15), f("outputTokens","Output tokens",2000000,"tokens",0,1e15), f("aInput","Option A input price",1,"USD/million tokens",0,1e9,0.001), f("aOutput","Option A output price",4,"USD/million tokens",0,1e9,0.001), f("bInput","Option B input price",2,"USD/million tokens",0,1e9,0.001), f("bOutput","Option B output price",8,"USD/million tokens",0,1e9,0.001), f("cInput","Option C input price",0.5,"USD/million tokens",0,1e9,0.001), f("cOutput","Option C output price",5,"USD/million tokens",0,1e9,0.001)
  ]},
  { slug: "inference-throughput", title: "LLM Inference Throughput Estimator", category: "AI Infrastructure & GPU Intelligence", description: "Estimate aggregate token capacity from supplied per-GPU throughput and utilization; this is not a measured benchmark.", fields: [
    f("gpuCount","GPU count",4,"GPUs",1,100000), f("tokensPerSecondPerGpu","Tokens/second per GPU",80,"tokens/s",0,1e9,0.1), f("utilization","Effective utilization",0.7,"fraction",0,1,0.01), f("tokensPerRequest","Average generated tokens/request",800,"tokens",1,1e9), f("targetRequestsPerSecond","Target request rate",1,"requests/s",0,1e9,0.01)
  ]},
  { slug: "incident-cost", title: "Cybersecurity Incident Cost Estimator", category: "Business & Cybersecurity Economics", description: "Build a scenario estimate from downtime, response, legal, notification and other direct costs.", fields: [
    f("downtimeHours","Service downtime",8,"hours",0,1e7,0.1), f("revenuePerHour","Revenue impact per hour",10000,"USD/hour",0,1e12,1), f("responseCost","Response and recovery",20000,"USD",0,1e12), f("legalCost","Legal and advisory",5000,"USD",0,1e12), f("affectedRecords","Affected records",10000,"records",0,1e13), f("notificationCostPerRecord","Notification cost",0.5,"USD/record",0,1e8,0.01), f("otherCost","Other direct costs",1000,"USD",0,1e12)
  ]},
  { slug: "saas-margin", title: "SaaS Infrastructure Margin Calculator", category: "Business & Cybersecurity Economics", description: "Estimate gross margin after infrastructure, AI usage, payment processing and direct support.", fields: [
    f("mrr","Monthly recurring revenue",50000,"USD/month",0,1e12), f("infrastructure","Infrastructure cost",5000,"USD/month",0,1e12), f("ai","AI/API cost",3000,"USD/month",0,1e12), f("paymentRate","Payment processing rate",0.03,"fraction of MRR",0,1,0.001), f("support","Direct support cost",2000,"USD/month",0,1e12)
  ]},
  { slug: "datacenter-energy", title: "Data-Centre Energy Cost Estimator", category: "Cloud & Infrastructure Economics", description: "Estimate facility energy and electricity cost from IT load, PUE and operating hours.", fields: [
    f("itLoadKw","IT load",100,"kW",0,1e9,0.1), f("pue","Power usage effectiveness",1.4,"PUE",1,10,0.01), f("hours","Operating hours",730,"hours/month",0,744), f("electricityRate","Electricity tariff",0.12,"USD/kWh",0,1e6,0.001)
  ]},
  { slug: "storage-growth", title: "Storage Growth Calculator", category: "Cloud & Infrastructure Economics", description: "Project retained storage using a compounded growth rate, replica count and storage unit price.", fields: [
    f("initialGb","Initial stored data",1000,"GB",0,1e13), f("monthlyGrowthRate","Monthly growth",0.1,"fraction",0,5,0.01), f("months","Retention horizon",12,"months",0,120,1), f("replicas","Copies including primary",2,"copies",1,20), f("pricePerGbMonth","Storage price",0.02,"USD/GB-month",0,1e6,0.001)
  ]},
  { slug: "agent-cost", title: "AI-Agent Operating Cost Calculator", category: "AI Infrastructure & GPU Intelligence", description: "Estimate agent run costs from step count, token consumption, tool charges and platform overhead.", fields: [
    f("runs","Agent runs",10000,"runs/month",0,1e13), f("stepsPerRun","Average steps per run",5,"steps",0,1e6,1), f("inputTokensPerStep","Input tokens per step",500,"tokens",0,1e9), f("outputTokensPerStep","Output tokens per step",200,"tokens",0,1e9), f("inputPricePerMillion","Input token price",1,"USD/million tokens",0,1e9,0.001), f("outputPricePerMillion","Output token price",4,"USD/million tokens",0,1e9,0.001), f("toolCostPerRun","Tool/API cost per run",0.01,"USD/run",0,1e9,0.001), f("monthlyPlatformCost","Platform and orchestration",200,"USD/month",0,1e12)
  ]}
];
const bySlug = new Map(LAB_CALCULATORS.map((calculator) => [calculator.slug, calculator]));
const metric = (label: string, value: number, unit = "USD"): LabMetric => ({ label, value, unit });
function read(calculator: LabCalculator, values: Values, key: string): number {
  const value = values[key];
  if (typeof value !== "number" || !Number.isFinite(value)) throw new RangeError(`${key} must be a finite number`);
  const definition = calculator.fields.find((item) => item.key === key)!;
  if (value < definition.min || value > definition.max) throw new RangeError(`${key} must be between ${definition.min} and ${definition.max}`);
  return value;
}
export function calculateLab(slug: string, values: Values): LabCalculation {
  const calculator = bySlug.get(slug);
  if (!calculator) throw new RangeError(`Unknown calculator: ${slug}`);
  for (const definition of calculator.fields) read(calculator, values, definition.key);
  const v = (key: string) => values[key];
  let metrics: LabMetric[];
  switch (slug) {
    case "rag-storage": {
      const vectorsGb = v("documents") * v("chunksPerDocument") * v("dimensions") * v("bytesPerDimension") / 1e9;
      const metadataGb = v("documents") * v("metadataMbPerDocument") / 1000;
      const physicalGb = (vectorsGb + metadataGb) * v("replicas");
      metrics = [metric("Vector payload", vectorsGb, "GB"), metric("Metadata", metadataGb, "GB"), metric("Replicated capacity", physicalGb, "GB"), metric("Monthly storage cost", physicalGb * v("pricePerGbMonth"))]; break;
    }
    case "ai-data-risk": {
      const likelihood = Math.min(1, v("sensitivity") * v("exposure") * (6 - v("controlMaturity")) / 125);
      const loss = v("records") * v("lossPerRecord") * likelihood;
      metrics = [metric("Scenario likelihood factor", likelihood, "fraction"), metric("Expected loss", loss), metric("Maximum direct exposure", v("records") * v("lossPerRecord"))]; break;
    }
    case "hardware-roi": {
      const electricity = v("powerKw") * v("hoursPerMonth") * v("electricityRate");
      const operating = electricity + v("maintenance");
      const savings = v("cloudBaseline") - operating;
      if (savings <= 0) throw new RangeError("The supplied local rig has no positive monthly savings against the cloud baseline");
      metrics = [metric("Monthly electricity", electricity), metric("Monthly local operating cost", operating), metric("Monthly savings", savings), metric("Payback period", v("purchaseCost") / savings, "months")]; break;
    }
    case "finetune-vs-rag": {
      const fineTune = v("preparationCost") + v("trainingHours") * v("trainingRate") + v("monthlyFineTuneInference") * v("months");
      const rag = v("indexingCost") + (v("monthlyRagInference") + v("monthlyRetrievalCost")) * v("months");
      metrics = [metric("Fine-tuning total", fineTune), metric("RAG total", rag), metric("Fine-tuning latency", v("fineTuneLatencyMs"), "ms"), metric("RAG latency", v("ragLatencyMs"), "ms"), metric("Cost difference (fine-tuning − RAG)", fineTune - rag)]; break;
    }
    case "cloud-migration": {
      const oneTime = v("discovery") + v("refactor") + v("transfer") + v("training") + v("dualRun");
      const savings = v("currentMonthly") - v("targetMonthly");
      if (savings <= 0) throw new RangeError("Migration has no positive monthly savings; simple payback is undefined");
      metrics = [metric("One-time migration cost", oneTime), metric("Monthly run-rate savings", savings), metric("Payback period", oneTime / savings, "months"), metric("First-year net benefit", savings * 12 - oneTime)]; break;
    }
    case "kubernetes-cost": {
      const nodes = v("nodeCount") * v("nodeHourly") * v("hours");
      const storage = v("storageGb") * v("storageRate");
      const lbs = v("loadBalancers") * v("loadBalancerRate");
      const egress = v("egressGb") * v("egressRate");
      metrics = [metric("Worker nodes", nodes), metric("Persistent storage", storage), metric("Load balancers", lbs), metric("Network egress", egress), metric("Monthly total", nodes + v("controlPlane") + storage + lbs + egress)]; break;
    }
    case "database-capacity": {
      const tableGb = v("rows") * v("rowBytes") / 1e9;
      const projectedGb = tableGb * (1 + v("indexOverhead")) * Math.pow(1 + v("monthlyGrowth"), v("months")) * v("replicas");
      metrics = [metric("Current table payload", tableGb, "GB"), metric("Projected storage", projectedGb, "GB"), metric("Projected GiB", projectedGb / 1.073741824, "GiB")]; break;
    }
    case "api-pricing": {
      const cost = (input: number, output: number) => (v("inputTokens") * input + v("outputTokens") * output) / 1e6;
      metrics = [metric("Option A", cost(v("aInput"), v("aOutput"))), metric("Option B", cost(v("bInput"), v("bOutput"))), metric("Option C", cost(v("cInput"), v("cOutput"))), metric("Lowest supplied price", Math.min(cost(v("aInput"), v("aOutput")), cost(v("bInput"), v("bOutput")), cost(v("cInput"), v("cOutput"))))]; break;
    }
    case "inference-throughput": {
      const tokens = v("gpuCount") * v("tokensPerSecondPerGpu") * v("utilization");
      const requests = tokens / v("tokensPerRequest");
      metrics = [metric("Estimated tokens/second", tokens, "tokens/s"), metric("Estimated requests/second", requests, "requests/s"), metric("Meets target", requests >= v("targetRequestsPerSecond") ? 1 : 0, "boolean")]; break;
    }
    case "incident-cost": {
      const downtime = v("downtimeHours") * v("revenuePerHour");
      const notifications = v("affectedRecords") * v("notificationCostPerRecord");
      metrics = [metric("Downtime impact", downtime), metric("Notification cost", notifications), metric("Total incident cost", downtime + v("responseCost") + v("legalCost") + notifications + v("otherCost"))]; break;
    }
    case "saas-margin": {
      const fees = v("mrr") * v("paymentRate");
      const cogs = v("infrastructure") + v("ai") + fees + v("support");
      metrics = [metric("Direct cost of revenue", cogs), metric("Gross profit", v("mrr") - cogs), metric("Gross margin", v("mrr") === 0 ? 0 : (v("mrr") - cogs) / v("mrr"), "fraction"), metric("Payment processing", fees)]; break;
    }
    case "datacenter-energy": {
      const energy = v("itLoadKw") * v("pue") * v("hours");
      metrics = [metric("Facility power", v("itLoadKw") * v("pue"), "kW"), metric("Monthly energy", energy, "kWh"), metric("Monthly energy cost", energy * v("electricityRate"))]; break;
    }
    case "storage-growth": {
      const capacity = v("initialGb") * Math.pow(1 + v("monthlyGrowthRate"), v("months")) * v("replicas");
      metrics = [metric("Retained capacity", capacity, "GB"), metric("Monthly run-rate storage cost", capacity * v("pricePerGbMonth"))]; break;
    }
    case "agent-cost": {
      const steps = v("runs") * v("stepsPerRun");
      const tokens = steps * (v("inputTokensPerStep") * v("inputPricePerMillion") + v("outputTokensPerStep") * v("outputPricePerMillion")) / 1e6;
      const tools = v("runs") * v("toolCostPerRun");
      metrics = [metric("Model token cost", tokens), metric("Tool/API cost", tools), metric("Monthly total", tokens + tools + v("monthlyPlatformCost")), metric("Cost per agent run", v("runs") === 0 ? 0 : (tokens + tools + v("monthlyPlatformCost")) / v("runs"))]; break;
    }
    default: throw new RangeError(`Unknown calculator: ${slug}`);
  }
  if (metrics.some((item) => !Number.isFinite(item.value))) throw new RangeError("This input combination exceeds the supported numeric range");
  const caveat = slug === "ai-data-risk"
    ? "Scenario estimate only. It is not a legal conclusion, actuarial model, compliance assessment or prediction of breach probability."
    : slug === "inference-throughput"
      ? "Planning estimate only. Actual throughput depends on model, hardware, batching, context, kernels, memory bandwidth and serving stack; no benchmark is implied."
      : slug === "finetune-vs-rag"
        ? "Costs and latency use only the supplied assumptions. This model does not claim equivalent answer quality, accuracy, freshness or suitability."
        : "Planning estimate based on user-supplied inputs. Excluded costs, taxes, discounts, utilization limits and provider-specific billing rules may materially change actual results.";
  return { metrics, caveat };
}
