import { AxiosError } from "axios";

export interface ValidationErrorBody {
  statusCode: number;
  message: string;
  source?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

export function getFieldErrors(
  error: AxiosError
): Record<string, string[]> | undefined {
  if (error.response?.status !== 400) return undefined;
  const data = error.response.data as ValidationErrorBody | undefined;
  return data?.errors;
}

export function normalizeFieldPath(field: string): string {
  return field.replace(/\[(\d+)\]/g, ".$1");
}

/**
 * True when a 403 response is ForcePasswordChangeGuard rejecting the
 * request, rather than an ordinary authorization failure. Confirmed live
 * against staffhub-backend (2026-09-03): GlobalExceptionFilter forwards the
 * guard's thrown ForbiddenException body as
 * `{ statusCode, message, source, details: { code }, timestamp }` - the
 * discriminator is nested under `details.code`, not top-level.
 */
export function isPasswordChangeRequired(error: AxiosError): boolean {
  if (error.response?.status !== 403) return false;

  const data = error.response.data as
    | { details?: { code?: string } }
    | undefined;

  return data?.details?.code === "PASSWORD_CHANGE_REQUIRED";
}
