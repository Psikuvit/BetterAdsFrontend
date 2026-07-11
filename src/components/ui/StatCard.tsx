import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  href?: string;
}

export function StatCard({ label, value, href }: StatCardProps) {
  const inner = (
    <>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="mt-2 font-mono text-2xl text-neutral-900 dark:text-white">{value}</p>
    </>
  );
  return (
    <Card>
      {href ? (
        <Link href={href} className="block hover:underline">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </Card>
  );
}
