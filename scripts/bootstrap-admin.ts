import { getPayload } from "payload";

import config from "../src/payload.config.ts";

const email = process.env.HEZQEN_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.HEZQEN_BOOTSTRAP_ADMIN_PASSWORD;
const confirmation = process.env.HEZQEN_BOOTSTRAP_ADMIN_CONFIRM;

if (confirmation !== "CREATE_FIRST_ADMIN") {
  throw new Error("Set HEZQEN_BOOTSTRAP_ADMIN_CONFIRM=CREATE_FIRST_ADMIN to continue.");
}
if (!email || !password || password.length < 20) {
  throw new Error(
    "Provide HEZQEN_BOOTSTRAP_ADMIN_EMAIL and a password of at least 20 characters.",
  );
}

const payload = await getPayload({ config });

try {
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

  process.stdout.write("Initial HEZQEN administrator created. Remove bootstrap credentials from the environment.\n");
} finally {
  await payload.destroy();
}
