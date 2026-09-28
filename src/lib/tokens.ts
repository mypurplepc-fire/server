import { randomBytes } from "crypto";

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
export const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function buildResetUrl(token: string, origin: string): string {
  return `${origin}/reset-password?token=${token}`;
}

export function buildSignupUrl(token: string, origin: string): string {
  return `${origin}/signup?token=${token}`;
}

/**
 * Stand-in for an email provider. Until SMTP is wired up, the link is written
 * to the container log so it can be retrieved with:
 *   docker compose logs -f app | grep RESET
 */
export function logEmail(kind: "RESET" | "INVITE", to: string, url: string): void {
  console.log(
    `\n[${kind}] To: ${to}\n[${kind}] Link (valid for a limited time): ${url}\n`,
  );
}
