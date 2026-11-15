export function createLivenessPayload(now: Date = new Date()) {
  return {
    status: "ok" as const,
    service: "hezqen" as const,
    checkedAt: now.toISOString(),
  };
}

export async function createReadinessResponse(check: () => Promise<unknown>): Promise<Response> {
  const headers = { "Cache-Control": "no-store" };

  try {
    await check();
    return Response.json({ status: "ready" }, { status: 200, headers });
  } catch {
    return Response.json({ status: "not_ready" }, { status: 503, headers });
  }
}
