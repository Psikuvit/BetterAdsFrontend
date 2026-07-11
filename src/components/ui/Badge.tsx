const STATUS_STYLES: Record<string, string> = {
  // campaign statuses
  DRAFT: "bg-white/10 text-white/60",
  ACTIVE: "bg-success/20 text-success",
  PAUSED: "bg-pending/20 text-pending",
  COMPLETED: "bg-white/10 text-white/60",
  ARCHIVED: "bg-white/10 text-white/40",
  // ad statuses
  PENDING: "bg-white/10 text-white/60",
  VALIDATING: "bg-electric-blue/20 text-electric-blue",
  AWAITING_FEATURES: "bg-vibrant-purple/20 text-vibrant-purple",
  PROCESSING: "bg-electric-blue/20 text-electric-blue",
  LIVE: "bg-success/20 text-success",
  FLAGGED: "bg-pending/20 text-pending",
  REJECTED: "bg-error/20 text-error",
  FAILED: "bg-error/20 text-error",
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
  const style = STATUS_STYLES[status] || "bg-white/10 text-white/60";
  const label = STATUS_LABELS[status] || status;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize animate-scale-in ${style}`}
    >
      {label}
    </span>
  );
}
