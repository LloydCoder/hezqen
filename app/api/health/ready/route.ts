import { getPayload } from "payload";

import config from "@/payload.config";
import { createReadinessResponse } from "@/lib/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let payloadPromise: ReturnType<typeof getPayload> | undefined;

async function getPayloadInstance() {
  payloadPromise ??= getPayload({ config });

  try {
    return await payloadPromise;
  } catch (error) {
    payloadPromise = undefined;
    throw error;
  }
}

export async function GET() {
  return createReadinessResponse(async () => {
    const payload = await getPayloadInstance();
    await payload.find({
      collection: "users",
      depth: 0,
      limit: 1,
      overrideAccess: true,
    });
  });
}
