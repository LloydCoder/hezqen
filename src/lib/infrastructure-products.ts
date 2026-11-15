export const infrastructureProducts = [
  {
    id: "IK-01",
    slug: "local-ai-deployment",
    name: "Local AI Deployment Kit",
    summary:
      "A reproducible local inference workspace built around Ollama and Open WebUI, with private networking, loopback-only host exposure, non-root containers and operational backup guidance.",
    capabilities: [
      "Ollama inference runtime with Open WebUI",
      "Loopback-only user interface and private container network",
      "Non-root container defaults and persistent model storage",
      "Health checks, backup and restore procedures",
      "Optional NVIDIA runtime configuration",
    ],
    platforms: ["Linux / amd64"],
    networkMode: "Network access is required to acquire model images; inference runs locally after setup.",
    validation:
      "Automated CPU runtime smoke tests pass in CI. The optional NVIDIA path has not been accepted on physical GPU hardware.",
    limitations:
      "NVIDIA GPU support has not passed physical hardware acceptance. This is a single-host local workspace, not an internet-facing or multi-tenant service.",
    status: "Engineering preview",
    license: "Apache-2.0",
    repositoryUrl:
      "https://github.com/LloydCoder/hezqen-infrastructure-standard/tree/main/products/local-ai-deployment",
  },
  {
    id: "IK-02",
    slug: "pii-protection",
    name: "PII Protection Middleware Kit",
    summary:
      "A fail-closed JSON middleware service for deterministic detection and policy-based redaction of selected sensitive values before data reaches downstream systems.",
    capabilities: [
      "Nested JSON traversal with bounded input handling",
      "Deterministic email, payment-card candidate, phone-like and IPv4 recognizers",
      "Redact, block and pseudonymization policy modes",
      "Fail-closed behavior and explicit error responses",
      "Containerized local deployment and runtime tests",
    ],
    platforms: ["Linux / amd64"],
    networkMode: "No external network is required for local JSON processing.",
    validation:
      "Unit and runtime tests cover the implemented deterministic recognizers and fail-closed behavior. A representative production corpus has not been independently evaluated.",
    limitations:
      "The current recognizers cover email, Luhn-valid payment-card candidates, phone-like strings and IPv4 only. This is not comprehensive PII detection and does not certify regulatory compliance.",
    status: "Engineering preview",
    license: "Apache-2.0",
    repositoryUrl:
      "https://github.com/LloydCoder/hezqen-infrastructure-standard/tree/main/products/pii-protection",
  },
  {
    id: "IK-03",
    slug: "multigpu-optimization",
    name: "Multi-GPU Optimization Kit",
    summary:
      "A hardware-aware planning toolkit for estimating model memory and generating tensor-parallel and pipeline-parallel deployment plans for vLLM-style inference.",
    capabilities: [
      "Model-weight and runtime memory estimation",
      "Tensor-parallel and pipeline-parallel planning",
      "vLLM-oriented configuration output",
      "Topology-aware validation and planning diagnostics",
      "CPU-only planner tests and CLI workflow",
    ],
    platforms: ["Linux / amd64", "Linux / arm64"],
    networkMode: "No external network is required for planning once model metadata is available.",
    validation:
      "Planner tests and CLI validation pass in CI. The planner is not a substitute for benchmarking the target model and hardware.",
    limitations:
      "The planner is CPU-only and uses simplified memory estimates. It is not a physical GPU benchmark, production throughput guarantee or substitute for workload-specific tuning.",
    status: "Engineering preview",
    license: "Apache-2.0",
    repositoryUrl:
      "https://github.com/LloydCoder/hezqen-infrastructure-standard/tree/main/products/multigpu-optimization",
  },
  {
    id: "IK-04",
    slug: "airgapped-rag",
    name: "Air-Gapped RAG Kit",
    summary:
      "An offline-first retrieval-augmented generation lab using Ollama and Qdrant, with explicit artifact export, checksums and disconnected installation procedures.",
    capabilities: [
      "Local document ingestion and retrieval workflow",
      "Ollama model runtime and Qdrant vector store",
      "Offline image and model artifact export",
      "Checksum-verified disconnected installation",
      "Operational validation for offline use",
    ],
    platforms: ["Linux / amd64"],
    networkMode: "Offline after required images and model artifacts have been staged and verified.",
    validation:
      "Disconnected installation and retrieval smoke tests pass in CI. The workflow validates a single-host lab deployment.",
    limitations:
      "The kit is a single-host offline deployment, not a highly available or multi-tenant service. Production use requires a separate identity, network and operational security design.",
    status: "Engineering preview",
    license: "Apache-2.0",
    repositoryUrl:
      "https://github.com/LloydCoder/hezqen-infrastructure-standard/tree/main/products/airgapped-rag",
  },
  {
    id: "IK-05",
    slug: "complete-infrastructure-lab-bundle",
    name: "Complete Infrastructure Lab Bundle",
    summary:
      "An offline distribution bundle that packages the four independently versioned infrastructure kits with a manifest, checksums, installation guidance and a CycloneDX first-party component inventory.",
    capabilities: [
      "Versioned archives for IK-01 through IK-04",
      "Manifest and SHA-256 integrity verification",
      "Offline installation and verification workflow",
      "CycloneDX 1.6 first-party component SBOM",
      "Single bundle entry point with no duplicated product source",
    ],
    platforms: ["See the individual kit platform matrices"],
    networkMode: "Offline installation and verification after the bundle has been acquired.",
    validation:
      "The bundle build, checksum verification and offline installation acceptance workflow pass in CI. The generated artifact is a CI preview artifact, not a permanent signed release.",
    limitations:
      "The current SBOM inventories first-party bundle components but is not a complete transitive dependency SBOM. CI artifacts are not yet signed provenance or permanent immutable commercial releases.",
    status: "Engineering preview",
    license: "Apache-2.0",
    repositoryUrl: "https://github.com/LloydCoder/hezqen-infrastructure-standard/tree/main/bundle",
  },
] as const;

export function getInfrastructureProduct(id: string) {
  return infrastructureProducts.find((product) => product.id === id);
}
