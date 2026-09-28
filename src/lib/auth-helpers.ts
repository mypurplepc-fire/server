import "server-only";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import type { Role } from "@/generated/prisma/enums";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export class AuthorizationError extends Error {
  readonly status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}

/** Returns the signed-in user, or null. Safe to call from any server component. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) return null;
  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    role: user.role,
  };
}

/** Server-component guard: redirects to /login when there is no session. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Server-component guard: redirects unauthenticated users to /login, insufficient roles to /dashboard. */
export async function requireRole(...allowed: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) redirect("/dashboard");
  return user;
}

export function hasRole(user: SessionUser | null, ...allowed: Role[]): boolean {
  return !!user && allowed.includes(user.role);
}

/**
 * Route-handler guard: throws AuthorizationError instead of redirecting.
 * Use this in API routes so failures become JSON responses.
 */
export async function requireApiRole(...allowed: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthorizationError("Not authenticated", 401);
  // Called with no roles => any authenticated user may proceed.
  if (allowed.length > 0 && !allowed.includes(user.role)) {
    throw new AuthorizationError("Insufficient permissions", 403);
  }
  return user;
}

export const ADMIN_ONLY: Role[] = ["ADMIN"];
export const PROJECT_WRITE_ROLES: Role[] = ["ADMIN", "PROJECT_MANAGER"];
