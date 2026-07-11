const STATUS_STYLES: Record<string, string> = {
  // campaign statuses
  DRAFT: "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-white/60",
  ACTIVE: "bg-success/15 text-success dark:bg-success/20 dark:text-success",
  PAUSED: "bg-pending/15 text-pending dark:bg-pending/20 dark:text-pending",
  COMPLETED: "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-white/60",
  ARCHIVED: "bg-neutral-100 text-neutral-400 dark:bg-white/10 dark:text-white/40",
  // ad statuses
  PENDING: "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-white/60",
  VALIDATING: "bg-electric-blue/10 text-electric-blue dark:bg-electric-blue/20 dark:text-electric-blue",
  AWAITING_FEATURES: "bg-vibrant-purple/10 text-vibrant-purple dark:bg-vibrant-purple/20 dark:text-vibrant-purple",
  PROCESSING: "bg-electric-blue/10 text-electric-blue dark:bg-electric-blue/20 dark:text-electric-blue",
  LIVE: "bg-success/15 text-success dark:bg-success/20 dark:text-success",
  FLAGGED: "bg-pending/15 text-pending dark:bg-pending/20 dark:text-pending",
  REJECTED: "bg-error/10 text-error dark:bg-error/20 dark:text-error",
  FAILED: "bg-error/10 text-error dark:bg-error/20 dark:text-error",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Queued",
  VALIDATING: "Validating",
  AWAITING_FEATURES: "Ready for setup",
  PROCESSING: "Processing",
  LIVE: "Live",
  FLAGGED: "Flagged",
  REJECTED: "Rejected",
  FAILED: "Failed",
};

export function Badge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-white/60";
  const label = STATUS_LABELS[status] || status;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize animate-scale-in ${style}`}
    >
      {label}
    </span>
  );
}
