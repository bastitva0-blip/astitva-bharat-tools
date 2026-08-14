"use client";

import { useRef, useState, useCallback, ChangeEvent } from "react";
import { Plus, Trash2, Printer, RotateCcw } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";

// ─── types ───────────────────────────────────────────────────────────────────

interface TableRow {
  id: string;
  name: string;
  amount: string; // string so the input stays controlled; parse on compute
}

interface FormState {
  // Company
  companyName: string;
  companyLogoDataUrl: string;
  companyAddress: string;
  // Employee
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  dateOfJoining: string;
  bankAccount: string;
  panNo: string;
  // Pay period
  month: string;
  year: string;
  // Tables
  earnings: TableRow[];
  deductions: TableRow[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function numberToWordsIndian(n: number): string {
  if (!isFinite(n) || n < 0) return "";
  if (n === 0) return "Zero";
  const integer = Math.floor(n);
  const paise = Math.round((n - integer) * 100);

  function twoDigits(x: number): string {
    if (x < 20) return ONES[x];
    return (TENS[Math.floor(x / 10)] + (x % 10 !== 0 ? " " + ONES[x % 10] : "")).trim();
  }

  function threeDigits(x: number): string {
    if (x === 0) return "";
    const h = Math.floor(x / 100);
    const r = x % 100;
    return (h > 0 ? ONES[h] + " Hundred" : "") + (r > 0 ? (h > 0 ? " " : "") + twoDigits(r) : "");
  }

  let words = "";
  const crore = Math.floor(integer / 10000000);
  const lakh = Math.floor((integer % 10000000) / 100000);
  const thousand = Math.floor((integer % 100000) / 1000);
  const rest = integer % 1000;

  if (crore > 0) words += twoDigits(crore) + " Crore ";
  if (lakh > 0) words += twoDigits(lakh) + " Lakh ";
  if (thousand > 0) words += twoDigits(thousand) + " Thousand ";
  if (rest > 0) words += threeDigits(rest) + " ";

  words = words.trim();
  if (paise > 0) words += " and " + twoDigits(paise) + " Paise";
  return words + " Only";
}

function parseAmount(s: string): number {
  const v = parseFloat(s.replace(/,/g, ""));
  return isNaN(v) ? 0 : v;
}

function fmt(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── initial state ────────────────────────────────────────────────────────────

function defaultEarnings(): TableRow[] {
  return [
    { id: uid(), name: "Basic Salary", amount: "" },
    { id: uid(), name: "House Rent Allowance (HRA)", amount: "" },
    { id: uid(), name: "Special Allowance", amount: "" },
    { id: uid(), name: "Transport Allowance", amount: "" },
  ];
}

function defaultDeductions(basicSalary: number): TableRow[] {
  const pf = basicSalary > 0 ? (basicSalary * 0.12).toFixed(2) : "";
  return [
    { id: uid(), name: "Provident Fund (PF)", amount: pf },
    { id: uid(), name: "Professional Tax", amount: "200" },
    { id: uid(), name: "Income Tax (TDS)", amount: "" },
  ];
}

const now = new Date();
const DEFAULT_STATE: FormState = {
  companyName: "",
  companyLogoDataUrl: "",
  companyAddress: "",
  employeeName: "",
  employeeId: "",
  designation: "",
  department: "",
  dateOfJoining: "",
  bankAccount: "",
  panNo: "",
  month: MONTHS[now.getMonth()],
  year: String(now.getFullYear()),
  earnings: defaultEarnings(),
  deductions: defaultDeductions(0),
};

// ─── sub-components ───────────────────────────────────────────────────────────

interface TableEditorProps {
  title: string;
  rows: TableRow[];
  onChange: (rows: TableRow[]) => void;
  amountHint?: (row: TableRow) => string | undefined;
}

function TableEditor({ title, rows, onChange, amountHint }: TableEditorProps) {
  const updateRow = (id: string, field: keyof TableRow, value: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };
  const addRow = () => onChange([...rows, { id: uid(), name: "", amount: "" }]);
  const removeRow = (id: string) => onChange(rows.filter((r) => r.id !== id));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Button variant="soft" size="sm" onClick={addRow} className="gap-1 text-xs">
          <Plus className="h-3 w-3" /> Add Row
        </Button>
      </div>
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground w-full">Component</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">Amount (₹)</th>
              <th className="px-2 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const hint = amountHint?.(row);
              return (
                <tr key={row.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(row.id, "name", e.target.value)}
                      className="w-full bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground"
                      placeholder="Component name"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.amount}
                      onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                      placeholder={hint ?? "0.00"}
                      className="w-28 bg-transparent border-0 outline-none text-sm text-right text-foreground placeholder:text-muted-foreground"
                    />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove row"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── preview ──────────────────────────────────────────────────────────────────

interface SlipPreviewProps {
  form: FormState;
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
}

function SlipPreview({ form, grossEarnings, totalDeductions, netPay }: SlipPreviewProps) {
  const maxRows = Math.max(form.earnings.length, form.deductions.length);
  const earningsPadded = [...form.earnings, ...Array(Math.max(0, maxRows - form.earnings.length)).fill(null)];
  const deductionsPadded = [...form.deductions, ...Array(Math.max(0, maxRows - form.deductions.length)).fill(null)];

  return (
    <div
      id="salary-slip-preview"
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#1a1a1a",
        background: "#ffffff",
        padding: "28px 32px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        maxWidth: "720px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", borderBottom: "2px solid #1e40af", paddingBottom: "14px", marginBottom: "14px" }}>
        {form.companyLogoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.companyLogoDataUrl} alt="Company Logo" style={{ height: "56px", width: "auto", objectFit: "contain" }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#1e40af" }}>
            {form.companyName || "Company Name"}
          </div>
          <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px", whiteSpace: "pre-line" }}>
            {form.companyAddress || "Company Address"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>Salary Slip</div>
          <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
            {form.month} {form.year}
          </div>
        </div>
      </div>

      {/* Employee Details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px", marginBottom: "14px", padding: "10px 12px", background: "#f8fafc", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
        {[
          ["Employee Name", form.employeeName || "—"],
          ["Employee ID", form.employeeId || "—"],
          ["Designation", form.designation || "—"],
          ["Department", form.department || "—"],
          ["Date of Joining", form.dateOfJoining || "—"],
          ["Bank A/C No.", form.bankAccount || "—"],
          ["PAN No.", form.panNo || "—"],
          ["Pay Period", `${form.month} ${form.year}`],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", gap: "6px" }}>
            <span style={{ color: "#6b7280", minWidth: "120px", flexShrink: 0 }}>{label}:</span>
            <span style={{ fontWeight: "500" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Earnings + Deductions table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
        <thead>
          <tr style={{ background: "#1e40af", color: "#ffffff" }}>
            <th style={{ padding: "7px 10px", textAlign: "left", width: "30%" }}>Earnings</th>
            <th style={{ padding: "7px 10px", textAlign: "right", width: "20%" }}>Amount (₹)</th>
            <th style={{ padding: "7px 10px", textAlign: "left", width: "30%", borderLeft: "1px solid #3b82f6" }}>Deductions</th>
            <th style={{ padding: "7px 10px", textAlign: "right", width: "20%" }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {earningsPadded.map((er, i) => {
            const dr = deductionsPadded[i] as TableRow | null;
            const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
            return (
              <tr key={i} style={{ background: bg }}>
                <td style={{ padding: "5px 10px", borderBottom: "1px solid #e5e7eb" }}>
                  {er ? (er as TableRow).name || "—" : ""}
                </td>
                <td style={{ padding: "5px 10px", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>
                  {er && parseAmount((er as TableRow).amount) > 0 ? fmt(parseAmount((er as TableRow).amount)) : er ? "—" : ""}
                </td>
                <td style={{ padding: "5px 10px", borderBottom: "1px solid #e5e7eb", borderLeft: "1px solid #e5e7eb" }}>
                  {dr ? dr.name || "—" : ""}
                </td>
                <td style={{ padding: "5px 10px", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>
                  {dr && parseAmount(dr.amount) > 0 ? fmt(parseAmount(dr.amount)) : dr ? "—" : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: "#eff6ff", fontWeight: "600" }}>
            <td style={{ padding: "7px 10px", borderTop: "2px solid #bfdbfe" }}>Gross Earnings</td>
            <td style={{ padding: "7px 10px", textAlign: "right", borderTop: "2px solid #bfdbfe" }}>₹ {fmt(grossEarnings)}</td>
            <td style={{ padding: "7px 10px", borderTop: "2px solid #bfdbfe", borderLeft: "1px solid #e5e7eb" }}>Total Deductions</td>
            <td style={{ padding: "7px 10px", textAlign: "right", borderTop: "2px solid #bfdbfe" }}>₹ {fmt(totalDeductions)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Net Pay */}
      <div style={{ background: "#1e40af", color: "#ffffff", borderRadius: "6px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "11px", opacity: 0.8, marginBottom: "2px" }}>Net Pay (Take Home)</div>
          <div style={{ fontSize: "11px", opacity: 0.75, fontStyle: "italic" }}>
            {numberToWordsIndian(netPay)}
          </div>
        </div>
        <div style={{ fontSize: "22px", fontWeight: "700" }}>₹ {fmt(netPay)}</div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "10px", color: "#9ca3af", borderTop: "1px solid #e5e7eb", paddingTop: "10px" }}>
        This is a computer-generated salary slip and does not require a physical signature.
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function SalarySlipForm() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Auto-compute PF when Basic Salary changes
  const handleEarningsChange = useCallback((rows: TableRow[]) => {
    const basic = parseAmount(rows.find((r) => r.name.toLowerCase().includes("basic"))?.amount ?? "");
    setForm((prev) => {
      const deductions = prev.deductions.map((d) => {
        if (d.name.toLowerCase().includes("provident fund") || d.name.toLowerCase().includes("pf")) {
          return { ...d, amount: basic > 0 ? (basic * 0.12).toFixed(2) : d.amount };
        }
        return d;
      });
      return { ...prev, earnings: rows, deductions };
    });
  }, []);

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("companyLogoDataUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setForm(DEFAULT_STATE);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const grossEarnings = form.earnings.reduce((sum, r) => sum + parseAmount(r.amount), 0);
  const totalDeductions = form.deductions.reduce((sum, r) => sum + parseAmount(r.amount), 0);
  const netPay = grossEarnings - totalDeductions;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #salary-slip-preview,
          #salary-slip-preview * { visibility: visible !important; }
          #salary-slip-preview {
            position: fixed !important;
            inset: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 20mm 18mm !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* ── LEFT: Form ── */}
        <div className="space-y-6">
          {/* Company */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground border-b border-border pb-1">Company Details</h2>
            <div className="grid grid-cols-1 gap-3">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Company Name</span>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  placeholder="Acme Pvt Ltd"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Company Logo (optional)</span>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full text-sm text-muted-foreground file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-muted file:text-foreground cursor-pointer"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Company Address</span>
                <textarea
                  value={form.companyAddress}
                  onChange={(e) => set("companyAddress", e.target.value)}
                  placeholder="123, MG Road, Bengaluru, Karnataka - 560001"
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none text-foreground placeholder:text-muted-foreground"
                />
              </label>
            </div>
          </section>

          {/* Employee */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground border-b border-border pb-1">Employee Details</h2>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["employeeName", "Employee Name", "Rahul Sharma", "text"],
                  ["employeeId", "Employee ID", "EMP-001", "text"],
                  ["designation", "Designation", "Software Engineer", "text"],
                  ["department", "Department", "Engineering", "text"],
                  ["dateOfJoining", "Date of Joining", "", "date"],
                  ["bankAccount", "Bank A/C No.", "XXXXXX1234", "text"],
                  ["panNo", "PAN No.", "ABCDE1234F", "text"],
                ] as [keyof FormState, string, string, string][]
              ).map(([key, label, placeholder, type]) => (
                <label key={key} className="space-y-1 col-span-1">
                  <span className="text-xs text-muted-foreground font-medium">{label}</span>
                  <input
                    type={type}
                    value={form[key] as string}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  />
                </label>
              ))}
            </div>
          </section>

          {/* Pay Period */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground border-b border-border pb-1">Pay Period</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Month</span>
                <select
                  value={form.month}
                  onChange={(e) => set("month", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Year</span>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => set("year", e.target.value)}
                  min="2000"
                  max="2099"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </label>
            </div>
          </section>

          {/* Earnings */}
          <section>
            <TableEditor
              title="Earnings"
              rows={form.earnings}
              onChange={handleEarningsChange}
            />
          </section>

          {/* Deductions */}
          <section>
            <TableEditor
              title="Deductions"
              rows={form.deductions}
              onChange={(rows) => set("deductions", rows)}
            />
          </section>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => window.print()}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print / Save as PDF
            </Button>
            <Button variant="outline" onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* ── RIGHT: Live Preview ── */}
        <div className="xl:sticky xl:top-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Preview</h2>
            <span className="text-xs text-muted-foreground">Updates as you type</span>
          </div>
          <div className="overflow-auto rounded-lg border border-border bg-white p-4 shadow-sm">
            <SlipPreview
              form={form}
              grossEarnings={grossEarnings}
              totalDeductions={totalDeductions}
              netPay={netPay}
            />
          </div>
        </div>
      </div>
    </>
  );
}
