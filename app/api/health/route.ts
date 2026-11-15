import { createLivenessPayload } from "@/lib/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return Response.json(createLivenessPayload(), {
    headers: { "Cache-Control": "no-store" },
  });
}
