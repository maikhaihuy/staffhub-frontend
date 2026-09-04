import { AxiosError } from "axios";

export interface ValidationErrorBody {
  statusCode: number;
  message: string;
  source?: string;
  details?: { code?: string };
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

// Matches staffhub-backend's ForcePasswordChangeGuard (force-password-change.guard.ts),
// which rejects a mustChangePassword-flagged session with 403 and
// `details: { code: 'PASSWORD_CHANGE_REQUIRED' }`, forwarded as-is by its
// GlobalExceptionFilter.
export function isPasswordChangeRequiredError(error: AxiosError): boolean {
  if (error.response?.status !== 403) return false;
  const data = error.response.data as ValidationErrorBody | undefined;
  return data?.details?.code === 'PASSWORD_CHANGE_REQUIRED';
}

export function normalizeFieldPath(field: string): string {
  return field.replace(/\[(\d+)\]/g, ".$1");
}
