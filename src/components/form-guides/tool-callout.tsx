import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface ToolCalloutProps {
  href: string;
  title: string;
  reason: string;
  icon?: React.ReactNode;
}

export function ToolCallout({ href, title, reason, icon }: ToolCalloutProps) {
  return (
    <Link
      href={href}
      className="bt-pressable group flex items-center justify-between gap-3 rounded-md border-l-4 border-l-accent-9 border border-surface-border-subtle bg-surface-2 p-4 text-left hover:border-l-accent-11"
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon ?? <ArrowRight className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
        <div className="min-w-0">
          <div className="truncate font-medium text-body-md">{title}</div>
          <div className="text-body-sm text-surface-fg-muted">{reason}</div>
        </div>
      </div>
      <ArrowRight className="size-4 shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
    </Link>
  );
}
