"use client";

import { useState, useEffect } from "react";
import { Printer, FileText } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { fire } from "@/lib/analytics/events";

// ─── Indian number-to-words ───────────────────────────────────────────────────

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function belowHundred(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ONES[n % 10] : "");
}

function belowThousand(n: number): string {
  if (n < 100) return belowHundred(n);
  const hundreds = ONES[Math.floor(n / 100)] + " Hundred";
  const rem = n % 100;
  return hundreds + (rem !== 0 ? " " + belowHundred(rem) : "");
}

function toIndianWords(amount: number): string {
  if (!isFinite(amount) || amount < 0) return "";
  if (amount === 0) return "Zero Rupees Only";

  const intPart = Math.floor(amount);
  const fracPart = Math.round((amount - intPart) * 100);

  let n = intPart;
  const parts: string[] = [];

  if (n >= 10_00_00_000) {
    // 100 crore+
    parts.push(belowThousand(Math.floor(n / 10_00_00_000)) + " Arab");
    n %= 10_00_00_000;
  }
  if (n >= 1_00_00_000) {
    parts.push(belowThousand(Math.floor(n / 1_00_00_000)) + " Crore");
    n %= 1_00_00_000;
  }
  if (n >= 1_00_000) {
    parts.push(belowThousand(Math.floor(n / 1_00_000)) + " Lakh");
    n %= 1_00_000;
  }
  if (n >= 1_000) {
    parts.push(belowThousand(Math.floor(n / 1_000)) + " Thousand");
    n %= 1_000;
  }
  if (n > 0) {
    parts.push(belowThousand(n));
  }

  let result = parts.join(" ") + " Rupees";

  if (fracPart > 0) {
    result += " and " + belowHundred(fracPart) + " Paise";
  }

  return result + " Only";
}

// ─── Types ────────────────────────────────────────────────────────────────────

const BANKS = [
  "State Bank of India (SBI)",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Punjab National Bank (PNB)",
  "Bank of Baroda (BOB)",
  "Canara Bank",
  "Kotak Mahindra Bank",
  "Bank of India",
  "Union Bank of India",
  "Other",
];

interface FormState {
  bank: string;
  payee: string;
  amountNum: string;
  amountWords: string;
  amountWordsEdited: boolean;
  dd: string;
  mm: string;
  yyyy: string;
  accountNo: string;
  ifsc: string;
}

function defaultForm(): FormState {
  return {
    bank: BANKS[0],
    payee: "",
    amountNum: "",
    amountWords: "",
    amountWordsEdited: false,
    dd: "",
    mm: "",
    yyyy: "",
    accountNo: "",
    ifsc: "",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

// ─── Cheque Preview ───────────────────────────────────────────────────────────

function ChequePreview({ form }: { form: FormState }) {
  const amtDisplay = form.amountNum
    ? "₹ " + Number(form.amountNum).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "₹ ___________";

  // Field cell style helpers
  const cellStyle: React.CSSProperties = {
    borderBottom: "1px solid #333",
    minWidth: "24px",
    textAlign: "center",
    fontSize: "14px",
    fontFamily: "monospace",
    padding: "0 2px",
    lineHeight: "1.6",
  };

  const dateCellStyle: React.CSSProperties = {
    ...cellStyle,
    width: "22px",
  };

  return (
    <div
      id="cheque-preview"
      className="cheque-paper mx-auto bg-white text-black"
      style={{
        width: "18cm",
        height: "8.5cm",
        border: "1.5px solid #333",
        borderRadius: "6px",
        padding: "10px 16px",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
      }}
    >
      {/* Top row: bank name + date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1a1a6e" }}>
            {form.bank || "Bank Name"}
          </div>
          <div style={{ fontSize: "10px", color: "#666", marginTop: "1px" }}>
            {form.accountNo ? `A/c No: ${form.accountNo}` : ""}
            {form.accountNo && form.ifsc ? "   " : ""}
            {form.ifsc ? `IFSC: ${form.ifsc}` : ""}
          </div>
        </div>

        {/* Date boxes */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "11px" }}>
          <span style={{ marginRight: "4px", color: "#555" }}>Date:</span>
          {[form.dd || "D", form.dd ? "" : "D"].filter((_, i) => i === 0).map((_, i) => (
            <div key={i} style={dateCellStyle}>{form.dd.padStart(2, " ")[i] ?? "_"}</div>
          ))}
          <div style={dateCellStyle}>{form.dd ? form.dd[0] ?? "_" : "D"}</div>
          <div style={dateCellStyle}>{form.dd ? form.dd[1] ?? "_" : "D"}</div>
          <span style={{ color: "#555" }}>/</span>
          <div style={dateCellStyle}>{form.mm ? form.mm[0] ?? "_" : "M"}</div>
          <div style={dateCellStyle}>{form.mm ? form.mm[1] ?? "_" : "M"}</div>
          <span style={{ color: "#555" }}>/</span>
          {(form.yyyy || "YYYY").padEnd(4, "Y").split("").map((ch, i) => (
            <div key={i} style={dateCellStyle}>{ch}</div>
          ))}
        </div>
      </div>

      {/* Pay line */}
      <div style={{ marginTop: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ whiteSpace: "nowrap", fontWeight: "600", fontSize: "12px" }}>Pay</span>
          <div
            style={{
              flex: 1,
              borderBottom: "1px solid #333",
              padding: "0 4px",
              fontSize: "13px",
              fontWeight: form.payee ? "bold" : "normal",
              color: form.payee ? "#111" : "#999",
              minHeight: "22px",
              lineHeight: "22px",
            }}
          >
            {form.payee || "Payee Name"}
          </div>
          <span style={{ whiteSpace: "nowrap", fontSize: "12px" }}>or Bearer</span>
        </div>
      </div>

      {/* Amount in words */}
      <div style={{ marginTop: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ whiteSpace: "nowrap", fontWeight: "600", fontSize: "12px" }}>Rupees</span>
          <div
            style={{
              flex: 1,
              borderBottom: "1px solid #333",
              padding: "0 4px",
              fontSize: "12px",
              color: form.amountWords ? "#111" : "#999",
              minHeight: "22px",
              lineHeight: "22px",
            }}
          >
            {form.amountWords || "Amount in words"}
          </div>
          <span style={{ whiteSpace: "nowrap", fontSize: "11px", color: "#555" }}>Only</span>
        </div>
      </div>

      {/* Bottom row: signature + amount box */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "8px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", color: "#555", marginBottom: "18px" }}>
            {form.ifsc ? `IFSC: ${form.ifsc}` : ""}
          </div>
          <div style={{ borderTop: "1px solid #333", width: "160px", paddingTop: "2px", fontSize: "10px", color: "#555" }}>
            Authorised Signature
          </div>
        </div>

        {/* Amount box */}
        <div
          style={{
            border: "1.5px solid #333",
            borderRadius: "4px",
            padding: "4px 10px",
            minWidth: "120px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "10px", color: "#555", marginBottom: "2px" }}>Amount</div>
          <div style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "monospace" }}>
            {amtDisplay}
          </div>
        </div>
      </div>

      {/* Overlay note */}
      <div
        style={{
          position: "absolute",
          top: "4px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "9px",
          color: "#aaa",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
        className="no-print-note"
      >
        Print and overlay on blank cheque — align before printing
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ChequePrintForm() {
  const [form, setForm] = useState<FormState>(defaultForm);

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  // Auto-compute words from number unless user has manually edited words
  useEffect(() => {
    if (form.amountWordsEdited) return;
    const n = parseFloat(form.amountNum);
    if (!form.amountNum || isNaN(n)) {
      update({ amountWords: "" });
    } else {
      update({ amountWords: toIndianWords(n) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.amountNum]);

  function handleAmountWordsChange(val: string) {
    update({ amountWords: val, amountWordsEdited: true });
  }

  function handleAmountNumChange(val: string) {
    update({ amountNum: val, amountWordsEdited: false });
  }

  function handlePrint() {
    fire("process_start", { tool_id: "cheque-print" });
    window.print();
  }

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #cheque-root { display: block !important; }
          #cheque-form-panel { display: none !important; }
          #cheque-preview-panel { display: block !important; width: 100% !important; padding: 0 !important; }
          #cheque-preview { box-shadow: none !important; }
          .no-print-note { display: none !important; }
          @page { margin: 10mm; size: A4; }
        }
      `}</style>

      <div id="cheque-root" className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* ── Form panel ───────────────────────────────────────────────── */}
        <section
          id="cheque-form-panel"
          className="w-full rounded-xl border border-border bg-card p-6 lg:max-w-[380px] lg:sticky lg:top-8"
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Cheque Details
            </p>

            <Field label="Bank">
              <select
                className={inputClass}
                value={form.bank}
                onChange={(e) => update({ bank: e.target.value })}
              >
                {BANKS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </Field>

            <Field label="Pay to (Payee Name) *">
              <input
                className={inputClass}
                placeholder="Full name of payee"
                value={form.payee}
                onChange={(e) => update({ payee: e.target.value })}
              />
            </Field>

            <Field label="Amount (₹) *">
              <input
                className={inputClass}
                type="number"
                min={0}
                step="0.01"
                placeholder="e.g. 150000"
                value={form.amountNum}
                onChange={(e) => handleAmountNumChange(e.target.value)}
              />
            </Field>

            <Field label="Amount in Words (auto-computed)">
              <textarea
                className={inputClass}
                rows={2}
                placeholder="Will be auto-filled from amount above"
                value={form.amountWords}
                onChange={(e) => handleAmountWordsChange(e.target.value)}
              />
            </Field>

            <Field label="Date">
              <div className="flex items-center gap-2">
                <input
                  className={inputClass}
                  maxLength={2}
                  placeholder="DD"
                  value={form.dd}
                  onChange={(e) => update({ dd: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                  style={{ width: "60px" }}
                />
                <span className="text-muted-foreground">/</span>
                <input
                  className={inputClass}
                  maxLength={2}
                  placeholder="MM"
                  value={form.mm}
                  onChange={(e) => update({ mm: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                  style={{ width: "60px" }}
                />
                <span className="text-muted-foreground">/</span>
                <input
                  className={inputClass}
                  maxLength={4}
                  placeholder="YYYY"
                  value={form.yyyy}
                  onChange={(e) => update({ yyyy: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  style={{ width: "80px" }}
                />
              </div>
            </Field>

            <Field label="Account Number (optional)">
              <input
                className={inputClass}
                placeholder="For reference only"
                value={form.accountNo}
                onChange={(e) => update({ accountNo: e.target.value })}
              />
            </Field>

            <Field label="IFSC Code (optional)">
              <input
                className={inputClass}
                placeholder="e.g. SBIN0001234"
                value={form.ifsc}
                onChange={(e) => update({ ifsc: e.target.value.toUpperCase() })}
              />
            </Field>

            <Button className="mt-2 w-full gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print Cheque Layout
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Print on plain paper, then align over your blank cheque.
            </p>
          </div>
        </section>

        {/* ── Preview panel ─────────────────────────────────────────────── */}
        <section id="cheque-preview-panel" className="flex-1 overflow-x-auto">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            Live preview — updates as you type
          </div>
          <div className="rounded-xl border border-border bg-neutral-100 p-6 dark:bg-neutral-900">
            <ChequePreview form={form} />
          </div>
          {form.amountNum && (
            <div className="mt-4 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground">
              <span className="font-medium">Amount in words: </span>
              {form.amountWords || "—"}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
