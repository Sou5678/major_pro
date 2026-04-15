import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ page, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prev = page - 1;
  const next = page + 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Build visible page numbers (max 5 around current)
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      <PaginationLink
        href={hasPrev ? (`${basePath}?page=${prev}` as Route) : null}
        disabled={!hasPrev}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </PaginationLink>

      {start > 1 && (
        <>
          <PaginationLink href={`${basePath}?page=1` as Route}>1</PaginationLink>
          {start > 2 && <span className="px-1 text-text-tertiary">…</span>}
        </>
      )}

      {pages.map((p) => (
        <PaginationLink
          key={p}
          href={`${basePath}?page=${p}` as Route}
          active={p === page}
        >
          {p}
        </PaginationLink>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-text-tertiary">…</span>}
          <PaginationLink href={`${basePath}?page=${totalPages}` as Route}>{totalPages}</PaginationLink>
        </>
      )}

      <PaginationLink
        href={hasNext ? (`${basePath}?page=${next}` as Route) : null}
        disabled={!hasNext}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  children,
  active,
  disabled,
  "aria-label": ariaLabel,
}: {
  href: Route | null;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const base =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm transition";
  const activeClass = "border-accent bg-accent/10 text-text-primary font-medium";
  const inactiveClass =
    "border-border bg-surface text-text-secondary hover:border-accent/40 hover:text-text-primary";
  const disabledClass = "border-border/40 bg-surface/40 text-text-tertiary cursor-not-allowed";

  if (disabled || !href) {
    return (
      <span className={cn(base, disabledClass)} aria-disabled="true" aria-label={ariaLabel}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={cn(base, active ? activeClass : inactiveClass)}
    >
      {children}
    </Link>
  );
}
