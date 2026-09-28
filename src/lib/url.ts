/**
 * Public base URL for building absolute links (password resets, invites).
 *
 * Inside Docker the app sees http://localhost:3000 because of the port
 * mapping, so request.url cannot be used directly. NEXTAUTH_URL is the
 * canonical public URL and is set by docker-compose; X-Forwarded-* is used
 * as a fallback when running behind a reverse proxy without NEXTAUTH_URL.
 */
export function getBaseUrl(request: Request): string {
  const fromEnv = process.env.NEXTAUTH_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const host = request.headers.get("x-forwarded-host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? "http";
    return `${proto}://${host}`.replace(/\/+$/, "");
  }

  return new URL(request.url).origin;
}
