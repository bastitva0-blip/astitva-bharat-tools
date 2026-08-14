"use client";

import { useState } from "react";
import { Printer, FileText } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { fire } from "@/lib/analytics/events";

// ─── NOC Type definitions ─────────────────────────────────────────────────────

type NocType = "travel" | "job-change" | "vehicle" | "property";

interface NocTypeDef {
  id: NocType;
  label: string;
  heading: string;
  issuerLabel: string;
  recipientLabel: string;
  extraFields: ExtraFieldDef[];
}

interface ExtraFieldDef {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

const NOC_TYPES: NocTypeDef[] = [
  {
    id: "travel",
    label: "Travel NOC",
    heading: "NO OBJECTION CERTIFICATE FOR TRAVEL ABROAD",
    issuerLabel: "Employer / Organisation",
    recipientLabel: "Employee Name",
    extraFields: [
      { key: "employeeDesignation", label: "Employee Designation", placeholder: "e.g. Senior Analyst" },
      { key: "travelDestination", label: "Travel Destination", placeholder: "e.g. United States, United Kingdom" },
      { key: "travelPurpose", label: "Purpose of Travel", placeholder: "e.g. attending an international conference" },
      { key: "travelDuration", label: "Travel Duration / Dates", placeholder: "e.g. 15 days, from 01 Sep to 15 Sep 2025" },
    ],
  },
  {
    id: "job-change",
    label: "Job Change NOC",
    heading: "NO OBJECTION CERTIFICATE FOR EMPLOYMENT",
    issuerLabel: "Current Employer",
    recipientLabel: "Employee Name",
    extraFields: [
      { key: "employeeDesignation", label: "Employee Designation", placeholder: "e.g. Team Lead" },
      { key: "employeeDepartment", label: "Department", placeholder: "e.g. Finance" },
      { key: "newOrganisation", label: "New Organisation (if known)", placeholder: "e.g. XYZ Corp Pvt. Ltd." },
    ],
  },
  {
    id: "vehicle",
    label: "Vehicle NOC",
    heading: "NO OBJECTION CERTIFICATE FOR VEHICLE TRANSFER",
    issuerLabel: "Seller / Current Owner",
    recipientLabel: "Buyer / New Owner Name",
    extraFields: [
      { key: "vehicleNumber", label: "Vehicle Registration Number", placeholder: "e.g. DL 01 AB 1234" },
      { key: "vehicleType", label: "Vehicle Make & Model", placeholder: "e.g. Honda Activa 6G, White" },
      { key: "chassisNumber", label: "Chassis Number (optional)", placeholder: "e.g. ME4JF503..." },
      { key: "engineNumber", label: "Engine Number (optional)", placeholder: "e.g. JF50E..." },
    ],
  },
  {
    id: "property",
    label: "Property NOC",
    heading: "NO OBJECTION CERTIFICATE FOR TENANT / OCCUPANT",
    issuerLabel: "Landlord / Housing Society",
    recipientLabel: "Tenant / Occupant Name",
    extraFields: [
      { key: "propertyAddress", label: "Property Address", placeholder: "Full address of the property", multiline: true },
      { key: "occupancyPeriod", label: "Occupancy Period", placeholder: "e.g. January 2023 to present" },
      { key: "nocPurpose", label: "Purpose of NOC", placeholder: "e.g. passport application, bank account, visa" },
    ],
  },
];

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  nocType: NocType;
  // Common
  issuerName: string;
  issuerAddress: string;
  recipientName: string;
  referenceNumber: string;
  place: string;
  date: string;
  signatoryName: string;
  signatoryDesignation: string;
  // Type-specific
  extra: Record<string, string>;
}

function today(): string {
  return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function defaultExtra(type: NocTypeDef): Record<string, string> {
  const r: Record<string, string> = {};
  for (const f of type.extraFields) r[f.key] = "";
  return r;
}

const INITIAL_NOC = NOC_TYPES[0];

const defaultForm: FormState = {
  nocType: "travel",
  issuerName: "",
  issuerAddress: "",
  recipientName: "",
  referenceNumber: "",
  place: "",
  date: today(),
  signatoryName: "",
  signatoryDesignation: "",
  extra: defaultExtra(INITIAL_NOC),
};

// ─── Body text builders ───────────────────────────────────────────────────────

function buildNocBody(form: FormState, typeDef: NocTypeDef): string[] {
  const e = form.extra;
  const recipient = form.recipientName || "_______________";
  const issuer = form.issuerName || "_______________";

  switch (form.nocType) {
    case "travel":
      return [
        `This is to certify that ${recipient}${e.employeeDesignation ? `, ${e.employeeDesignation},` : ""} is a bonafide employee of ${issuer}. We have no objection to ${recipient} travelling abroad${e.travelDestination ? ` to ${e.travelDestination}` : ""}${e.travelPurpose ? ` for the purpose of ${e.travelPurpose}` : ""}${e.travelDuration ? ` for a period of ${e.travelDuration}` : ""}.`,
        `${recipient} will continue to be employed with us during and after the said travel. All responsibilities and obligations towards the organisation shall be duly maintained.`,
        `This NOC is being issued on the specific request of the concerned employee and is valid only for the purpose mentioned above.`,
      ];
    case "job-change":
      return [
        `This is to certify that ${recipient}${e.employeeDesignation ? `, ${e.employeeDesignation},` : ""}${e.employeeDepartment ? ` (${e.employeeDepartment} Department)` : ""} is / was employed with ${issuer}. We have no objection to ${recipient} seeking employment with${e.newOrganisation ? ` ${e.newOrganisation} or` : ""} any other organisation of ${recipient}'s choice.`,
        `${recipient} has maintained a good conduct and professional record during their association with us. We wish them well in their professional endeavours.`,
        `This NOC is issued in good faith and on the specific request of the concerned employee.`,
      ];
    case "vehicle":
      return [
        `This is to certify that I / We, ${issuer}, am / are the registered owner(s) of the vehicle bearing registration number ${e.vehicleNumber || "_______________"}${e.vehicleType ? ` (${e.vehicleType})` : ""}${e.chassisNumber ? `, Chassis No. ${e.chassisNumber}` : ""}${e.engineNumber ? `, Engine No. ${e.engineNumber}` : ""}.`,
        `I / We have no objection to the transfer of ownership of the above-mentioned vehicle to ${recipient}. The vehicle is free from all encumbrances, loans, hypothecation, and legal disputes as on the date of this certificate.`,
        `I / We hereby authorise ${recipient} to proceed with the registration transfer formalities at the concerned Regional Transport Office (RTO).`,
      ];
    case "property":
      return [
        `This is to certify that ${recipient} is residing as a bonafide tenant / occupant at the property located at ${e.propertyAddress || "_______________"}${e.occupancyPeriod ? `, since ${e.occupancyPeriod}` : ""}.`,
        `${issuer}, being the landlord / owner / authorised representative of the said property, has no objection to ${recipient} using this NOC for the purpose of ${e.nocPurpose || "official documentation"}.`,
        `The tenant / occupant has been maintaining good conduct and paying rent / dues regularly. This NOC is issued in good faith on the specific request of the concerned party.`,
      ];
    default:
      return [];
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

// ─── Preview ──────────────────────────────────────────────────────────────────

function NocPreview({ form, typeDef }: { form: FormState; typeDef: NocTypeDef }) {
  const paragraphs = buildNocBody(form, typeDef);

  return (
    <div
      id="noc-preview"
      className="noc-paper mx-auto bg-white text-black"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "18mm 20mm 20mm",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "13px",
        lineHeight: "1.8",
        boxSizing: "border-box",
        position: "relative",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 16px 0 rgba(0,0,0,0.08)",
      }}
    >
      {/* Issuer letterhead */}
      <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "2px solid #1a3a5e", paddingBottom: "12px" }}>
        <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "0.05em", textTransform: "uppercase", color: "#1a3a5e" }}>
          {form.issuerName || "ORGANISATION / ISSUER NAME"}
        </div>
        {form.issuerAddress && (
          <div style={{ fontSize: "11px", color: "#555", marginTop: "4px", whiteSpace: "pre-line" }}>
            {form.issuerAddress}
          </div>
        )}
      </div>

      {/* Ref & Date */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "12px", color: "#333" }}>
        <div>
          {form.referenceNumber && <><strong>Ref No.:</strong> {form.referenceNumber}</>}
        </div>
        <div>
          <strong>Date:</strong> {form.date || today()}
          {form.place && <span style={{ marginLeft: "16px" }}><strong>Place:</strong> {form.place}</span>}
        </div>
      </div>

      {/* Heading */}
      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            letterSpacing: "0.12em",
            textDecoration: "underline",
            textTransform: "uppercase",
          }}
        >
          {typeDef.heading}
        </div>
      </div>

      {/* Salutation */}
      <p style={{ marginBottom: "14px" }}>
        <strong>To Whom It May Concern,</strong>
      </p>

      {/* Body paragraphs */}
      {paragraphs.map((para, i) => (
        <p key={i} style={{ textAlign: "justify", marginBottom: "14px" }}>
          {para}
        </p>
      ))}

      {/* Closing */}
      <p style={{ marginBottom: "40px" }}>
        This certificate is issued without any prejudice and at the specific request of the concerned party.
      </p>

      {/* Signature block */}
      <div style={{ marginTop: "32px" }}>
        <div style={{ borderTop: "1px solid #333", width: "180px", marginBottom: "6px" }} />
        <div style={{ fontSize: "13px", fontWeight: "bold" }}>
          {form.signatoryName || "Authorised Signatory"}
        </div>
        {form.signatoryDesignation && (
          <div style={{ fontSize: "12px", color: "#333" }}>{form.signatoryDesignation}</div>
        )}
        <div style={{ fontSize: "12px", color: "#333" }}>{form.issuerName || "Organisation Name"}</div>
        <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
          {form.place ? `${form.place}, ` : ""}{form.date || today()}
        </div>
      </div>

      {/* Seal placeholder */}
      <div
        style={{
          position: "absolute",
          bottom: "28mm",
          right: "20mm",
          width: "80px",
          height: "80px",
          border: "1px dashed #bbb",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "9px",
          color: "#bbb",
          textAlign: "center",
        }}
      >
        Seal /<br />Stamp
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NocGeneratorForm() {
  const [form, setForm] = useState<FormState>(defaultForm);

  const typeDef = NOC_TYPES.find((t) => t.id === form.nocType) ?? NOC_TYPES[0];

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function updateExtra(key: string, value: string) {
    setForm((prev) => ({ ...prev, extra: { ...prev.extra, [key]: value } }));
  }

  function switchType(nocType: NocType) {
    const newDef = NOC_TYPES.find((t) => t.id === nocType) ?? NOC_TYPES[0];
    setForm((prev) => ({ ...prev, nocType, extra: defaultExtra(newDef) }));
  }

  function handlePrint() {
    fire("process_start", { tool_id: "noc-generator" });
    fire("download_click", { tool_id: "noc-generator", output_type: "application/pdf" });
    window.print();
  }

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #noc-root { display: block !important; }
          #noc-form-panel { display: none !important; }
          #noc-preview-panel { display: block !important; width: 100% !important; padding: 0 !important; }
          #noc-preview { box-shadow: none !important; border: 1px solid #ccc !important; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      <div id="noc-root" className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* ── Form panel ───────────────────────────────────────────────── */}
        <section
          id="noc-form-panel"
          className="w-full rounded-xl border border-border bg-card p-6 lg:max-w-[420px] lg:sticky lg:top-8"
        >
          {/* NOC type selector */}
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              NOC Type
            </p>
            <div className="flex flex-wrap gap-2">
              {NOC_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => switchType(t.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    form.nocType === t.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Issuer Details
            </p>

            <Field label={`${typeDef.issuerLabel} Name *`}>
              <input
                className={inputClass}
                placeholder="Full name or organisation name"
                value={form.issuerName}
                onChange={(e) => update({ issuerName: e.target.value })}
              />
            </Field>

            <Field label="Issuer Address">
              <textarea
                className={inputClass}
                rows={2}
                placeholder="Full address"
                value={form.issuerAddress}
                onChange={(e) => update({ issuerAddress: e.target.value })}
              />
            </Field>

            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Recipient Details
            </p>

            <Field label={`${typeDef.recipientLabel} *`}>
              <input
                className={inputClass}
                placeholder="Full name"
                value={form.recipientName}
                onChange={(e) => update({ recipientName: e.target.value })}
              />
            </Field>

            {/* Type-specific fields */}
            {typeDef.extraFields.length > 0 && (
              <>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {typeDef.label} — Details
                </p>
                {typeDef.extraFields.map((f) =>
                  f.multiline ? (
                    <Field key={f.key} label={f.label}>
                      <textarea
                        className={inputClass}
                        rows={3}
                        placeholder={f.placeholder}
                        value={form.extra[f.key] ?? ""}
                        onChange={(e) => updateExtra(f.key, e.target.value)}
                      />
                    </Field>
                  ) : (
                    <Field key={f.key} label={f.label}>
                      <input
                        className={inputClass}
                        placeholder={f.placeholder}
                        value={form.extra[f.key] ?? ""}
                        onChange={(e) => updateExtra(f.key, e.target.value)}
                      />
                    </Field>
                  )
                )}
              </>
            )}

            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Signatory &amp; Issue Details
            </p>

            <Field label="Reference Number (optional)">
              <input
                className={inputClass}
                placeholder="e.g. HR/NOC/2025/001"
                value={form.referenceNumber}
                onChange={(e) => update({ referenceNumber: e.target.value })}
              />
            </Field>

            <div className="flex gap-2">
              <Field label="Signatory Name *">
                <input
                  className={inputClass}
                  placeholder="e.g. Priya Mehta"
                  value={form.signatoryName}
                  onChange={(e) => update({ signatoryName: e.target.value })}
                />
              </Field>
              <Field label="Designation">
                <input
                  className={inputClass}
                  placeholder="e.g. HR Head"
                  value={form.signatoryDesignation}
                  onChange={(e) => update({ signatoryDesignation: e.target.value })}
                />
              </Field>
            </div>

            <div className="flex gap-2">
              <Field label="Place *">
                <input
                  className={inputClass}
                  placeholder="City / Town"
                  value={form.place}
                  onChange={(e) => update({ place: e.target.value })}
                />
              </Field>
              <Field label="Date *">
                <input
                  className={inputClass}
                  type="text"
                  placeholder="DD Month YYYY"
                  value={form.date}
                  onChange={(e) => update({ date: e.target.value })}
                />
              </Field>
            </div>

            <Button className="mt-2 w-full gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print / Save as PDF
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              In print dialog → choose &quot;Save as PDF&quot; to get a PDF file.
            </p>
          </div>
        </section>

        {/* ── Preview panel ─────────────────────────────────────────────── */}
        <section id="noc-preview-panel" className="flex-1 overflow-x-auto">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            Live preview — updates as you type
          </div>
          <NocPreview form={form} typeDef={typeDef} />
        </section>
      </div>
    </>
  );
}
