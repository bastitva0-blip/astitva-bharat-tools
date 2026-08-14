"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Printer, RotateCcw } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { fire } from "@/lib/analytics";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Party {
  name: string;
  gstin: string;
  address: string;
  state: string;
  phone: string;
  email: string;
}

interface LineItem {
  id: string;
  description: string;
  hsn: string;
  qty: string;
  unit: string;
  rate: string;
  gstPct: string;
}

interface InvoiceData {
  seller: Party;
  buyer: Party;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;
  items: LineItem[];
  notes: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

const GST_RATES = ["0", "5", "12", "18", "28"];
const UNITS = ["Nos", "Kg", "Hrs", "Ltr", "Mtr", "Box", "Pcs", "Set", "Sqft", "Day"];

const todayStr = () => new Date().toISOString().split("T")[0];

function newItem(): LineItem {
  return { id: crypto.randomUUID(), description: "", hsn: "", qty: "1", unit: "Nos", rate: "", gstPct: "18" };
}

function emptyParty(): Party {
  return { name: "", gstin: "", address: "", state: "", phone: "", email: "" };
}

function defaultData(): InvoiceData {
  return {
    seller: emptyParty(),
    buyer: emptyParty(),
    invoiceNo: "INV-001",
    invoiceDate: todayStr(),
    dueDate: "",
    placeOfSupply: "",
    items: [newItem()],
    notes: "",
  };
}

// ── Number to words (Indian system) ──────────────────────────────────────────

function numToWords(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function below100(x: number): string {
    if (x < 20) return ones[x];
    return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
  }
  function below1000(x: number): string {
    if (x < 100) return below100(x);
    return ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + below100(x % 100) : "");
  }

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;

  let out = "";
  if (crore) out += below1000(crore) + " Crore ";
  if (lakh) out += below100(lakh) + " Lakh ";
  if (thousand) out += below1000(thousand) + " Thousand ";
  if (rest) out += below1000(rest);
  return out.trim();
}

function amountInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let out = numToWords(rupees) + " Rupees";
  if (paise) out += " and " + numToWords(paise) + " Paise";
  return out + " Only";
}

// ── Calculation helpers ───────────────────────────────────────────────────────

interface ComputedItem {
  item: LineItem;
  qty: number;
  rate: number;
  gstPct: number;
  taxableAmt: number;
  gstAmt: number;
  total: number;
}

function computeItems(items: LineItem[]): ComputedItem[] {
  return items.map((item) => {
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    const gstPct = parseFloat(item.gstPct) || 0;
    const taxableAmt = qty * rate;
    const gstAmt = (taxableAmt * gstPct) / 100;
    const total = taxableAmt + gstAmt;
    return { item, qty, rate, gstPct, taxableAmt, gstAmt, total };
  });
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PartyFields({
  prefix,
  label,
  data,
  onChange,
  gstinOptional,
}: {
  prefix: string;
  label: string;
  data: Party;
  onChange: (p: Party) => void;
  gstinOptional?: boolean;
}) {
  const field = (key: keyof Party, lbl: string, placeholder?: string, type = "text") => (
    <div key={key}>
      <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`${prefix}-${key}`}>
        {lbl}
      </label>
      <input
        id={`${prefix}-${key}`}
        type={type}
        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        placeholder={placeholder || lbl}
        value={data[key]}
        onChange={(e) => onChange({ ...data, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">{label}</h3>
      {field("name", "Business / Person Name")}
      {field("gstin", gstinOptional ? "GSTIN (optional)" : "GSTIN", "22AAAAA0000A1Z5")}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          rows={2}
          placeholder="Street, City, PIN"
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
        <select
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          value={data.state}
          onChange={(e) => onChange({ ...data, state: e.target.value })}
        >
          <option value="">Select State</option>
          {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {field("phone", "Phone", "9876543210", "tel")}
      {field("email", "Email", "you@example.com", "email")}
    </div>
  );
}

// ── Invoice Preview ───────────────────────────────────────────────────────────

function InvoicePreview({ data }: { data: InvoiceData }) {
  const computed = computeItems(data.items);
  const subtotal = computed.reduce((s, c) => s + c.taxableAmt, 0);
  const totalGst = computed.reduce((s, c) => s + c.gstAmt, 0);
  const grandTotal = subtotal + totalGst;

  const isIgst = data.seller.state && data.placeOfSupply && data.seller.state !== data.placeOfSupply;

  const formatDate = (d: string) => {
    if (!d) return "—";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div
      id="gst-invoice-preview"
      style={{
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "12px",
        color: "#111",
        background: "#fff",
        width: "100%",
        maxWidth: "794px",
        margin: "0 auto",
        padding: "32px 36px",
        boxSizing: "border-box",
        border: "1px solid #e2e8f0",
        borderRadius: "4px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", borderBottom: "2px solid #1e40af", paddingBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#1e40af", lineHeight: 1.2 }}>
            {data.seller.name || "Your Business Name"}
          </div>
          {data.seller.gstin && (
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>GSTIN: {data.seller.gstin}</div>
          )}
          <div style={{ marginTop: "6px", color: "#374151", lineHeight: "1.5", whiteSpace: "pre-line" }}>
            {data.seller.address || "Seller Address"}
          </div>
          {data.seller.state && <div style={{ color: "#374151" }}>{data.seller.state}</div>}
          {data.seller.phone && <div style={{ color: "#374151" }}>Ph: {data.seller.phone}</div>}
          {data.seller.email && <div style={{ color: "#374151" }}>Email: {data.seller.email}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#1e40af", letterSpacing: "0.05em" }}>TAX INVOICE</div>
          <table style={{ marginTop: "8px", marginLeft: "auto" }}>
            <tbody>
              <tr>
                <td style={{ color: "#64748b", paddingRight: "8px" }}>Invoice No.</td>
                <td style={{ fontWeight: 600 }}>{data.invoiceNo || "—"}</td>
              </tr>
              <tr>
                <td style={{ color: "#64748b", paddingRight: "8px" }}>Date</td>
                <td style={{ fontWeight: 600 }}>{formatDate(data.invoiceDate)}</td>
              </tr>
              {data.dueDate && (
                <tr>
                  <td style={{ color: "#64748b", paddingRight: "8px" }}>Due Date</td>
                  <td style={{ fontWeight: 600 }}>{formatDate(data.dueDate)}</td>
                </tr>
              )}
              {data.placeOfSupply && (
                <tr>
                  <td style={{ color: "#64748b", paddingRight: "8px" }}>Place of Supply</td>
                  <td style={{ fontWeight: 600 }}>{data.placeOfSupply}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ marginBottom: "20px", background: "#f8fafc", padding: "12px 16px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Bill To</div>
        <div style={{ fontWeight: 700, fontSize: "13px" }}>{data.buyer.name || "Buyer Name"}</div>
        {data.buyer.gstin && <div style={{ color: "#475569", fontSize: "11px" }}>GSTIN: {data.buyer.gstin}</div>}
        <div style={{ color: "#374151", whiteSpace: "pre-line", marginTop: "2px" }}>{data.buyer.address}</div>
        {data.buyer.state && <div style={{ color: "#374151" }}>{data.buyer.state}</div>}
        {data.buyer.phone && <div style={{ color: "#374151" }}>Ph: {data.buyer.phone}</div>}
      </div>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px", fontSize: "11px" }}>
        <thead>
          <tr style={{ background: "#1e40af", color: "#fff" }}>
            <th style={{ padding: "6px 4px", textAlign: "center", width: "28px" }}>#</th>
            <th style={{ padding: "6px 4px", textAlign: "left" }}>Item / Description</th>
            <th style={{ padding: "6px 4px", textAlign: "center", width: "55px" }}>HSN/SAC</th>
            <th style={{ padding: "6px 4px", textAlign: "center", width: "40px" }}>Qty</th>
            <th style={{ padding: "6px 4px", textAlign: "center", width: "40px" }}>Unit</th>
            <th style={{ padding: "6px 4px", textAlign: "right", width: "70px" }}>Rate (₹)</th>
            <th style={{ padding: "6px 4px", textAlign: "center", width: "45px" }}>GST%</th>
            <th style={{ padding: "6px 4px", textAlign: "right", width: "70px" }}>GST Amt</th>
            <th style={{ padding: "6px 4px", textAlign: "right", width: "75px" }}>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {computed.map((c, i) => (
            <tr key={c.item.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <td style={{ padding: "6px 4px", textAlign: "center" }}>{i + 1}</td>
              <td style={{ padding: "6px 4px" }}>{c.item.description || "—"}</td>
              <td style={{ padding: "6px 4px", textAlign: "center" }}>{c.item.hsn || "—"}</td>
              <td style={{ padding: "6px 4px", textAlign: "center" }}>{c.qty}</td>
              <td style={{ padding: "6px 4px", textAlign: "center" }}>{c.item.unit}</td>
              <td style={{ padding: "6px 4px", textAlign: "right" }}>{fmt(c.rate)}</td>
              <td style={{ padding: "6px 4px", textAlign: "center" }}>{c.gstPct}%</td>
              <td style={{ padding: "6px 4px", textAlign: "right" }}>{fmt(c.gstAmt)}</td>
              <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 600 }}>{fmt(c.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <table style={{ fontSize: "12px", minWidth: "240px" }}>
          <tbody>
            <tr>
              <td style={{ padding: "3px 12px 3px 0", color: "#475569" }}>Subtotal (Taxable Value)</td>
              <td style={{ textAlign: "right", fontWeight: 500 }}>₹ {fmt(subtotal)}</td>
            </tr>
            {isIgst ? (
              <tr>
                <td style={{ padding: "3px 12px 3px 0", color: "#475569" }}>IGST</td>
                <td style={{ textAlign: "right" }}>₹ {fmt(totalGst)}</td>
              </tr>
            ) : (
              <>
                <tr>
                  <td style={{ padding: "3px 12px 3px 0", color: "#475569" }}>CGST</td>
                  <td style={{ textAlign: "right" }}>₹ {fmt(totalGst / 2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "3px 12px 3px 0", color: "#475569" }}>SGST</td>
                  <td style={{ textAlign: "right" }}>₹ {fmt(totalGst / 2)}</td>
                </tr>
              </>
            )}
            <tr style={{ borderTop: "2px solid #1e40af" }}>
              <td style={{ padding: "6px 12px 6px 0", fontWeight: 700, fontSize: "14px", color: "#1e40af" }}>Grand Total</td>
              <td style={{ textAlign: "right", fontWeight: 700, fontSize: "14px", color: "#1e40af" }}>₹ {fmt(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in Words */}
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "4px", padding: "8px 12px", marginBottom: "20px", fontSize: "11px" }}>
        <span style={{ color: "#475569" }}>Amount in Words: </span>
        <span style={{ fontWeight: 600, color: "#1e3a8a" }}>{amountInWords(grandTotal)}</span>
      </div>

      {/* Notes */}
      {data.notes && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "4px", letterSpacing: "0.08em" }}>Notes / Terms</div>
          <div style={{ color: "#374151", whiteSpace: "pre-line", fontSize: "11px" }}>{data.notes}</div>
        </div>
      )}

      {/* Signature */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "32px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ textAlign: "center", minWidth: "180px" }}>
          <div style={{ height: "48px" }} />
          <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "6px", fontSize: "11px", color: "#475569" }}>
            Authorised Signatory
            {data.seller.name && <div style={{ fontWeight: 600, color: "#111" }}>{data.seller.name}</div>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "24px", fontSize: "10px", color: "#94a3b8", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
        This is a computer-generated invoice. Generated via BharatTools.in
      </div>
    </div>
  );
}

// ── Main Form Component ───────────────────────────────────────────────────────

export function GstInvoiceForm() {
  const [data, setData] = useState<InvoiceData>(defaultData);
  const [hasStarted, setHasStarted] = useState(false);

  const markStarted = useCallback(() => {
    if (!hasStarted) {
      fire("process_start", { tool_id: "gst-invoice" });
      setHasStarted(true);
    }
  }, [hasStarted]);

  const setSeller = (seller: Party) => setData((d) => ({ ...d, seller }));
  const setBuyer = (buyer: Party) => setData((d) => ({ ...d, buyer }));

  const updateItem = (id: string, patch: Partial<LineItem>) => {
    setData((d) => ({ ...d, items: d.items.map((it) => it.id === id ? { ...it, ...patch } : it) }));
  };

  const addItem = () => {
    markStarted();
    setData((d) => ({ ...d, items: [...d.items, newItem()] }));
  };

  const removeItem = (id: string) => {
    setData((d) => ({ ...d, items: d.items.length > 1 ? d.items.filter((it) => it.id !== id) : d.items }));
  };

  const handlePrint = () => {
    fire("download_click", { tool_id: "gst-invoice", output_type: "application/pdf" });
    window.print();
  };

  const handleReset = () => {
    setData(defaultData());
    setHasStarted(false);
  };

  const inputCls = "w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100";

  return (
    <>
      {/* Print-only CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #gst-invoice-preview, #gst-invoice-preview * { visibility: visible !important; }
          #gst-invoice-preview {
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 12mm 14mm !important;
            font-size: 10pt !important;
            box-shadow: none !important;
          }
        }
        @page { size: A4; margin: 0; }
      `}</style>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* ── Left: Form Panel ── */}
        <div className="xl:w-[480px] shrink-0 space-y-6 print:hidden">
          {/* Seller */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <PartyFields prefix="seller" label="Seller (Your Business)" data={data.seller} onChange={setSeller} />
          </section>

          {/* Buyer */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <PartyFields prefix="buyer" label="Buyer / Bill To" data={data.buyer} onChange={setBuyer} gstinOptional />
          </section>

          {/* Invoice Details */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Invoice No.</label>
                <input
                  className={inputCls}
                  value={data.invoiceNo}
                  placeholder="INV-001"
                  onChange={(e) => setData((d) => ({ ...d, invoiceNo: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Invoice Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={data.invoiceDate}
                  onChange={(e) => setData((d) => ({ ...d, invoiceDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={data.dueDate}
                  onChange={(e) => setData((d) => ({ ...d, dueDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Place of Supply</label>
                <select
                  className={inputCls}
                  value={data.placeOfSupply}
                  onChange={(e) => setData((d) => ({ ...d, placeOfSupply: e.target.value }))}
                >
                  <option value="">Select State</option>
                  {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Line Items */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Line Items</h3>
            <div className="space-y-3">
              {data.items.map((item, idx) => (
                <div key={item.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Item {idx + 1}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={data.items.length === 1}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Product / Service description"
                    value={item.description}
                    onChange={(e) => { markStarted(); updateItem(item.id, { description: e.target.value }); }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={inputCls}
                      placeholder="HSN / SAC code"
                      value={item.hsn}
                      onChange={(e) => updateItem(item.id, { hsn: e.target.value })}
                    />
                    <select
                      className={inputCls}
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                    >
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">Qty</label>
                      <input
                        type="number"
                        min="0"
                        className={inputCls}
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, { qty: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">Rate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        className={inputCls}
                        value={item.rate}
                        placeholder="0.00"
                        onChange={(e) => updateItem(item.id, { rate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">GST %</label>
                      <select
                        className={inputCls}
                        value={item.gstPct}
                        onChange={(e) => updateItem(item.id, { gstPct: e.target.value })}
                      >
                        {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addItem} className="w-full gap-1">
              <Plus size={14} /> Add Item
            </Button>
          </section>

          {/* Notes */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Notes / Terms</h3>
            <textarea
              className={inputCls + " resize-none"}
              rows={3}
              placeholder="Payment terms, bank details, thank you note…"
              value={data.notes}
              onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
            />
          </section>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handlePrint} className="flex-1 gap-2">
              <Printer size={16} /> Print / Save as PDF
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw size={14} /> Reset
            </Button>
          </div>
        </div>

        {/* ── Right: Invoice Preview ── */}
        <div className="flex-1 min-w-0">
          <div className="sticky top-4">
            <div className="mb-3 flex items-center justify-between print:hidden">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Live Preview</span>
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
                <Printer size={13} /> Print / PDF
              </Button>
            </div>
            <div className="overflow-x-auto">
              <InvoicePreview data={data} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
