const STATUS_STYLES: Record<string, string> = {
  // campaign statuses
  DRAFT: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  ACTIVE: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  PAUSED: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  COMPLETED: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  ARCHIVED: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500",
  // ad statuses
  PENDING: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  VALIDATING: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  AWAITING_FEATURES: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  PROCESSING: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  LIVE: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  FLAGGED: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  REJECTED: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  FAILED: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
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
  const style = STATUS_STYLES[status] || "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  );
}
