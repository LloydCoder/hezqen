import type { PayloadRequest } from "payload";

export async function withRequestContext<T>(
  req: PayloadRequest,
  additions: Record<string, unknown>,
  operation: () => Promise<T>,
): Promise<T> {
  const mutableRequest = req as unknown as { context?: Record<string, unknown> };
  const previousContext = mutableRequest.context;
  mutableRequest.context = { ...(previousContext ?? {}), ...additions };
  try {
    return await operation();
  } finally {
    mutableRequest.context = previousContext;
  }
}
