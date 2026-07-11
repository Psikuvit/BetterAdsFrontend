import { TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full text-sm">{children}</table>;
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-800">
        {children}
      </tr>
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50 dark:border-white/5 dark:hover:bg-white/[0.04]">
      {children}
    </tr>
  );
}

export function Th({ children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className="px-4 py-3 font-medium" {...props}>
      {children}
    </th>
  );
}

export function Td({ children, className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-3 ${className}`} {...props}>
      {children}
    </td>
  );
}
