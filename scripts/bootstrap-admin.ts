import { getPayload } from "payload";

import config from "../src/payload.config.ts";

const email = process.env.HEZQEN_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.HEZQEN_BOOTSTRAP_ADMIN_PASSWORD;
const confirmation = process.env.HEZQEN_BOOTSTRAP_ADMIN_CONFIRM;

let exitCode = 0;
let payload: Awaited<ReturnType<typeof getPayload>> | undefined;

try {
  if (confirmation !== "CREATE_FIRST_ADMIN") {
    throw new Error("Set HEZQEN_BOOTSTRAP_ADMIN_CONFIRM=CREATE_FIRST_ADMIN to continue.");
  }
  if (!email || !password || password.length < 20) {
    throw new Error(
      "Provide HEZQEN_BOOTSTRAP_ADMIN_EMAIL and a password of at least 20 characters.",
    );
  }

  payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "users",
    limit: 1,
    overrideAccess: true,
  });

  if (existing.totalDocs > 0) {
    throw new Error("Bootstrap refused: a user already exists. Use the normal admin workflow.");
  }

  await payload.create({
    collection: "users",
    overrideAccess: true,
    data: {
      email,
      name: "HEZQEN Administrator",
      password,
      role: "administrator",
      active: true,
    },
  });

  process.stdout.write(
    "Initial HEZQEN administrator created. Remove bootstrap credentials from the environment.\n",
  );
} catch (error) {
  exitCode = 1;
  const message = error instanceof Error ? error.message : "HEZQEN administrator bootstrap failed.";
  process.stderr.write(`${message}\n`);
} finally {
  if (payload) {
    try {
      await payload.destroy();
    } catch {
      exitCode = 1;
      process.stderr.write("Payload shutdown failed after bootstrap.\n");
    }
  }
}

process.exit(exitCode);
