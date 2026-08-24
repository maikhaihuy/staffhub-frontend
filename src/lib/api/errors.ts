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
