"use client";

import { ShieldCheck } from "lucide-react";
import { useT } from "@/i18n/provider";

// "0 bytes sent" badge per tool-design-spec §2.4. Pair with the
// runWithZeroBytesAssert wrapper around the processing call to make the
// claim architecturally true, not just decorative.
export function TrustBadge({ className }: { className?: string }) {
  const dict = useT();
  const t = dict.shell.trustBadge;
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-success-7 bg-success-3 px-3 py-1 text-body-xs text-success-11 ${className ?? ""}`}
      role="status"
    >
      <ShieldCheck className="size-3.5" aria-hidden />
      <span className="font-medium">{t.label}</span>
      <span className="text-success-11/80">· {t.description}</span>
    </div>
  );
}
