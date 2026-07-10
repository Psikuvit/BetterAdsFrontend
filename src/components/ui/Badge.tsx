const STATUS_STYLES: Record<string, string> = {
  // campaign statuses
  draft: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  active: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  paused: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  completed: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  archived: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500",
  // ad statuses
  pending: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  validating: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  processing: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  live: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  flagged: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  failed: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Queued",
  validating: "Validating",
  processing: "Processing",
  live: "Live",
  flagged: "Flagged",
  rejected: "Rejected",
  failed: "Failed",
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
