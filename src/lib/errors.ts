import { ApiError } from "./types";

export function errorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof ApiError) return err.body.error || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
