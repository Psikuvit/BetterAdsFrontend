import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  status?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, backHref, backLabel, status, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel ?? "Back"}
          </Link>
        )}
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-2xl font-medium text-neutral-900 dark:text-white">{title}</h1>
          {status && <Badge status={status} />}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
