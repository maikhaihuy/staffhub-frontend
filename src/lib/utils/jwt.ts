export function decodeJwt<T>(token: string): T | null {
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Payload-only expiry check (no signature verification - the frontend has no
 * signing secret; the backend verifies the signature on every real API
 * call). A malformed token or one missing `exp` is treated as expired, so
 * middleware fails closed rather than letting an undecodable token through.
 */
export function isTokenExpired(token: string): boolean {
  const claims = decodeJwt<{ exp?: number }>(token);
  if (!claims?.exp) return true;

  return claims.exp * 1000 <= Date.now();
}
