import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-success/15 text-success",
  PAUSED: "bg-pending/15 text-pending",
  COMPLETED: "bg-muted text-muted-foreground",
  ARCHIVED: "bg-muted text-muted-foreground/60",
  PENDING: "bg-muted text-muted-foreground",
  VALIDATING: "bg-electric-blue/15 text-electric-blue",
  AWAITING_FEATURES: "bg-vibrant-purple/15 text-vibrant-purple",
  PROCESSING: "bg-electric-blue/15 text-electric-blue",
  LIVE: "bg-success/15 text-success",
  FLAGGED: "bg-pending/15 text-pending",
  REJECTED: "bg-destructive/15 text-destructive",
  FAILED: "bg-destructive/15 text-destructive",
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

export function Badge({ status, className = "" }: { status: string; className?: string }) {
  const style = STATUS_STYLES[status] || "bg-muted text-muted-foreground";
  const label = STATUS_LABELS[status] || status;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
