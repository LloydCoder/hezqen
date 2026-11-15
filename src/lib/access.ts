export interface ActiveUserActor {
  id: string | number;
  role?: string;
}

/** Treat disabled or malformed sessions as unauthenticated for collection access. */
export function getActiveUserActor(user: unknown): ActiveUserActor | null {
  if (!user || typeof user !== "object" || !("id" in user)) return null;
  const record = user as Record<string, unknown>;
  if (record.active === false) return null;
  if (typeof record.id !== "string" && typeof record.id !== "number") return null;
  return {
    id: record.id,
    role: typeof record.role === "string" ? record.role : undefined,
  };
}

export function hasActiveRole(user: unknown, roles: readonly string[]): boolean {
  const actor = getActiveUserActor(user);
  return Boolean(actor?.role && roles.includes(actor.role));
}
