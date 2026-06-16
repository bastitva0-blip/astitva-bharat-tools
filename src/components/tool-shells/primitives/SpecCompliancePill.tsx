"use client";

export type ComplianceStatus = "pass" | "warn" | "fail" | "neutral";

interface SpecCompliancePillProps {
  status: ComplianceStatus;
  label: string;
  detail?: string;
}

const STATUS_CLASS: Record<ComplianceStatus, string> = {
  pass: "text-success-11",
  warn: "text-warning-11",
  fail: "text-error-11",
  neutral: "text-surface-fg-muted",
};

// Generic spec-compliance result strip — shells decide what "pass" means and
// pass in the label + detail (base-infrastructure-plan §3). Purely
// presentational so shells own the comparison logic (bytes-only,
// dims + bytes, format-only, etc.).
export function SpecCompliancePill({ status, label, detail }: SpecCompliancePillProps) {
  return (
    <div className="flex items-center justify-between text-body-sm">
      {detail ? <span className="font-medium text-surface-fg">{detail}</span> : <span />}
      <span className={STATUS_CLASS[status]}>{label}</span>
    </div>
  );
}
