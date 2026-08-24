/**
 * A safe returnUrl is a same-origin relative path: starts with exactly one
 * `/`, never `//` or `/\` (both of which browsers can normalize into a
 * protocol-relative URL pointing off-site).
 */
export function isSafeReturnUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  if (!value.startsWith('/')) return false;
  if (value.startsWith('//') || value.startsWith('/\\')) return false;

  return true;
}

export function buildReturnUrl(pathname: string, search: string, hash = ''): string {
  return `${pathname}${search}${hash}`;
}

export function resolveReturnUrl(value: string | null | undefined, fallback: string): string {
  return isSafeReturnUrl(value) ? value : fallback;
}
