import type { PayloadRequest } from "payload";

const TRUSTED_MARKERS = Symbol("hezqen.trustedRequestContext");

type TrustedContext = Record<string, unknown> & {
  [TRUSTED_MARKERS]?: ReadonlySet<string>;
};

export function hasTrustedRequestContext(context: unknown, marker: string): boolean {
  if (!context || typeof context !== "object") return false;
  const markers = (context as TrustedContext)[TRUSTED_MARKERS];
  return markers instanceof Set && markers.has(marker);
}

export async function withRequestContext<T>(
  req: PayloadRequest,
  additions: Record<string, unknown>,
  operation: () => Promise<T>,
): Promise<T> {
  const mutableRequest = req as unknown as { context?: TrustedContext };
  const previousContext = mutableRequest.context;
  const inheritedMarkers = previousContext?.[TRUSTED_MARKERS] ?? [];
  const context: TrustedContext = {
    ...(previousContext ?? {}),
    ...additions,
  };
  Object.defineProperty(context, TRUSTED_MARKERS, {
    value: new Set([...inheritedMarkers, ...Object.keys(additions)]),
    enumerable: false,
  });
  mutableRequest.context = context;
  try {
    return await operation();
  } finally {
    mutableRequest.context = previousContext;
  }
}
