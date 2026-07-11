"use client";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-skeleton rounded-xl ${className}`} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass rounded-2xl p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-white/5">
        <Skeleton className="h-4 w-full" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 border-b border-neutral-100 dark:border-white/5 last:border-0">
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5">
      <Skeleton className="h-4 w-20 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="glass rounded-2xl p-5">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="flex flex-col gap-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
