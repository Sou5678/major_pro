import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(value: Date | string) {
  return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
}

export function apiSuccess<T>(data: T) {
  return { success: true as const, data, error: null };
}

export function apiError(message: string, code?: string) {
  return {
    success: false as const,
    data: null,
    error: {
      code: code ?? "UNKNOWN_ERROR",
      message,
    },
  };
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function scoreTone(score: number) {
  if (score < 50) return "text-danger";
  if (score < 70) return "text-warning";
  if (score < 90) return "text-success";
  return "text-accent";
}
