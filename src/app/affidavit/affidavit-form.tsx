"use client";

import { useState } from "react";
import { Printer, FileText } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";

// ─── Template definitions ────────────────────────────────────────────────────

type TemplateId =
  | "general"
  | "income"
  | "address"
  | "namechange"
  | "character";

interface Template {
  id: TemplateId;
  label: string;
  extraFields: ExtraFieldDef[];
  declarationText: string;
}

interface ExtraFieldDef {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: "general",
    label: "General Affidavit",
    extraFields: [],
    declarationText:
      "1. That I am a citizen of India and a permanent resident of the above-mentioned address.\n\n2. That the facts stated herein are true and correct to the best of my knowledge and belief.\n\n3. That nothing has been concealed or misstated in this affidavit.",
  },
  {
    id: "income",
    label: "Income Affidavit",
    extraFields: [
      { key: "annualIncome", label: "Annual Income (₹)", placeholder: "e.g. 3,60,000" },
      { key: "incomeSource", label: "Source of Income", placeholder: "e.g. Salary, Business, Agriculture" },
    ],
    declarationText:
      "1. That my annual income from all sources is approximately ₹[annualIncome] (Rupees [annualIncome] only) per annum.\n\n2. That the primary source of my income is [incomeSource].\n\n3. That I do not have any other source of income, which has not been declared above.\n\n4. That this affidavit is being given for the purpose of income declaration and may be produced before any authority if required.",
  },
  {
    id: "address",
    label: "Address Proof Affidavit",
    extraFields: [
      { key: "residingSince", label: "Residing at this address since", placeholder: "e.g. January 2018" },
      { key: "proofReason", label: "Purpose of this affidavit", placeholder: "e.g. Bank KYC, Aadhaar update" },
    ],
    declarationText:
      "1. That I am permanently residing at the address mentioned above since [residingSince].\n\n2. That the above address is my present and permanent residential address.\n\n3. That I am furnishing this affidavit as proof of address for the purpose of [proofReason].\n\n4. That the facts stated herein are true and correct to the best of my knowledge and belief.",
  },
  {
    id: "namechange",
    label: "Name Change Affidavit",
    extraFields: [
      { key: "oldName", label: "Old Name (as per existing documents)", placeholder: "Full name as recorded earlier" },
      { key: "newName", label: "New Name (proposed / corrected)", placeholder: "Full name as desired" },
      { key: "reason", label: "Reason for Name Change", placeholder: "e.g. Spelling correction, Marriage, Personal preference" },
    ],
    declarationText:
      "1. That I was formerly known as [oldName] and henceforth I shall be known as [newName].\n\n2. That both the names mentioned above refer to one and the same person, i.e. myself.\n\n3. That the reason for changing my name is [reason].\n\n4. That I request all concerned authorities, departments and institutions to record my name as [newName] in all official documents and records.\n\n5. That this affidavit is being executed for the purpose of name change and for getting all official documents updated accordingly.",
  },
  {
    id: "character",
    label: "Character Certificate",
    extraFields: [
      { key: "purpose", label: "Purpose of this certificate", placeholder: "e.g. Employment, Higher Studies, Passport" },
      { key: "knownSince", label: "Residing / known in this locality since", placeholder: "e.g. 2010" },
    ],
    declarationText:
      "1. That I have been residing at the above-mentioned address since [knownSince] and am well known in my locality.\n\n2. That I am a law-abiding citizen and have never been involved in any criminal activity or legal dispute.\n\n3. That my character and conduct have always been good and I bear a good moral reputation in the society.\n\n4. That this affidavit is being submitted for the purpose of [purpose].\n\n5. That the facts stated herein are true and correct to the best of my knowledge and belief.",
  },
];

// ─── Field helpers ────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  deponentName: string;
  relation: "S/o" | "D/o" | "W/o";
  parentOrSpouseName: string;
  age: string;
  occupation: string;
  addressLine1: string;
  addressLine2: string;
  district: string;
  state: string;
  pincode: string;
  courtOrNotary: string;
  place: string;
  date: string;
  declarationText: string;
  extra: Record<string, string>;
}

function defaultForm(template: Template): FormState {
  const extra: Record<string, string> = {};
  for (const f of template.extraFields) extra[f.key] = "";
  return {
    deponentName: "",
    relation: "S/o",
    parentOrSpouseName: "",
    age: "",
    occupation: "",
    addressLine1: "",
    addressLine2: "",
    district: "",
    state: "",
    pincode: "",
    courtOrNotary: "",
    place: "",
    date: today(),
    declarationText: template.declarationText,
    extra,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
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

function buildPreviewText(form: FormState): string {
  let text = form.declarationText;
  for (const [k, v] of Object.entries(form.extra)) {
    text = text.replaceAll(`[${k}]`, v || `[${k}]`);
  }
  return text;
}

function AffidavitPreview({ form, template }: { form: FormState; template: Template }) {
  const fullAddress = [form.addressLine1, form.addressLine2, form.district, form.state, form.pincode]
    .filter(Boolean)
    .join(", ");

  const intro = `I, ${form.deponentName || "_______________"}, ${form.relation} ${
    form.parentOrSpouseName || "_______________"
  }, aged ${form.age || "___"} years, Occupation: ${
    form.occupation || "_______________"
  }, residing at ${fullAddress || "_______________"}, do hereby solemnly affirm and declare as under:`;

  const paragraphs = buildPreviewText(form)
    .split("\n\n")
    .filter(Boolean);

  return (
    <div
      id="affidavit-preview"
      className="affidavit-paper mx-auto bg-white text-black"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "18mm 16mm",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "13px",
        lineHeight: "1.8",
        border: "2px solid #1a1a5e",
        boxShadow: "inset 0 0 0 6px #fff, inset 0 0 0 8px #1a1a5e, inset 0 0 0 12px #fff",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Stamp paper label */}
      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#555",
          marginBottom: "4px",
          letterSpacing: "0.08em",
        }}
      >
        NON-JUDICIAL STAMP PAPER OF ₹100/-
      </div>

      {/* Title */}
      <h1
        style={{
          textAlign: "center",
          fontSize: "18px",
          fontWeight: "bold",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          margin: "8px 0 4px",
        }}
      >
        AFFIDAVIT
      </h1>

      {/* Template subtitle */}
      <div style={{ textAlign: "center", fontSize: "12px", color: "#333", marginBottom: "16px" }}>
        ({template.label})
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #999", marginBottom: "16px" }} />

      {/* Intro paragraph */}
      <p style={{ textAlign: "justify", marginBottom: "14px" }}>{intro}</p>

      {/* Declaration paragraphs */}
      {paragraphs.map((para, i) => (
        <p key={i} style={{ textAlign: "justify", marginBottom: "10px" }}>
          {para}
        </p>
      ))}

      {/* Closing */}
      <p style={{ marginTop: "18px", textAlign: "justify", fontStyle: "italic" }}>
        I declare that the above statement is true and correct to the best of my knowledge and belief. No part of it is
        false and nothing material has been concealed.
      </p>

      {/* Verification */}
      <div style={{ marginTop: "30px", fontSize: "12px" }}>
        <strong>VERIFICATION:</strong> Verified at {form.place || "_______________"} on this{" "}
        {form.date || today()} that the contents of the above affidavit are true and correct to the best of my
        knowledge and belief.
      </div>

      {/* Signature section */}
      <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ textAlign: "left", minWidth: "160px" }}>
          <div style={{ borderTop: "1px solid #333", width: "160px", marginBottom: "4px" }} />
          <div>
            <strong>DEPONENT</strong>
          </div>
          <div style={{ fontSize: "12px" }}>{form.deponentName || "_______________"}</div>
        </div>

        <div style={{ textAlign: "center", minWidth: "160px" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              border: "1px dashed #999",
              margin: "0 auto 4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "#888",
            }}
          >
            Stamp &amp; Seal
          </div>
        </div>

        <div style={{ textAlign: "right", minWidth: "160px" }}>
          <div style={{ borderTop: "1px solid #333", width: "160px", marginBottom: "4px", marginLeft: "auto" }} />
          <div>
            <strong>NOTARY / OATH COMMISSIONER</strong>
          </div>
          <div style={{ fontSize: "12px" }}>{form.courtOrNotary || "_______________"}</div>
        </div>
      </div>

      <div style={{ marginTop: "12px", fontSize: "11px", color: "#555", textAlign: "left" }}>
        Place: {form.place || "_______________"} &nbsp;&nbsp; Date: {form.date || "_______________"}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AffidavitForm() {
  const [activeTemplateId, setActiveTemplateId] = useState<TemplateId>("general");
  const [forms, setForms] = useState<Record<TemplateId, FormState>>(() => {
    const init = {} as Record<TemplateId, FormState>;
    for (const t of TEMPLATES) init[t.id] = defaultForm(t);
    return init;
  });

  const template = TEMPLATES.find((t) => t.id === activeTemplateId)!;
  const form = forms[activeTemplateId];

  function updateForm(patch: Partial<FormState>) {
    setForms((prev) => ({
      ...prev,
      [activeTemplateId]: { ...prev[activeTemplateId], ...patch },
    }));
  }

  function updateExtra(key: string, value: string) {
    setForms((prev) => ({
      ...prev,
      [activeTemplateId]: {
        ...prev[activeTemplateId],
        extra: { ...prev[activeTemplateId].extra, [key]: value },
      },
    }));
  }

  function switchTemplate(id: TemplateId) {
    setActiveTemplateId(id);
  }

  return (
    <>
      {/* Print styles — only the preview is visible when printing */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #affidavit-root { display: block !important; }
          #affidavit-form-panel { display: none !important; }
          #affidavit-preview-panel { display: block !important; width: 100% !important; padding: 0 !important; }
          #affidavit-preview { box-shadow: none !important; border: 2px solid #1a1a5e !important; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      <div id="affidavit-root" className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* ── Form panel ───────────────────────────────────────────────── */}
        <section
          id="affidavit-form-panel"
          className="w-full rounded-xl border border-border bg-card p-6 lg:max-w-[420px] lg:sticky lg:top-8"
        >
          {/* Template tabs */}
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Affidavit Type
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => switchTemplate(t.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeTemplateId === t.id
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
              Deponent Details
            </p>

            <Field label="Full Name of Deponent *">
              <input
                className={inputClass}
                placeholder="As per Aadhaar / official document"
                value={form.deponentName}
                onChange={(e) => updateForm({ deponentName: e.target.value })}
              />
            </Field>

            <div className="flex gap-2">
              <Field label="Relation">
                <select
                  className={inputClass}
                  value={form.relation}
                  onChange={(e) => updateForm({ relation: e.target.value as FormState["relation"] })}
                >
                  <option value="S/o">S/o (Son of)</option>
                  <option value="D/o">D/o (Daughter of)</option>
                  <option value="W/o">W/o (Wife of)</option>
                </select>
              </Field>
              <Field label="Father's / Husband's Name *">
                <input
                  className={inputClass}
                  placeholder="Full name"
                  value={form.parentOrSpouseName}
                  onChange={(e) => updateForm({ parentOrSpouseName: e.target.value })}
                />
              </Field>
            </div>

            <div className="flex gap-2">
              <Field label="Age (years) *">
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  max={120}
                  placeholder="e.g. 32"
                  value={form.age}
                  onChange={(e) => updateForm({ age: e.target.value })}
                />
              </Field>
              <Field label="Occupation *">
                <input
                  className={inputClass}
                  placeholder="e.g. Farmer, Salaried"
                  value={form.occupation}
                  onChange={(e) => updateForm({ occupation: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Address Line 1 *">
              <input
                className={inputClass}
                placeholder="House no., Street, Mohalla"
                value={form.addressLine1}
                onChange={(e) => updateForm({ addressLine1: e.target.value })}
              />
            </Field>

            <Field label="Address Line 2">
              <input
                className={inputClass}
                placeholder="Village, Tehsil, Town (optional)"
                value={form.addressLine2}
                onChange={(e) => updateForm({ addressLine2: e.target.value })}
              />
            </Field>

            <div className="flex gap-2">
              <Field label="District *">
                <input
                  className={inputClass}
                  placeholder="District"
                  value={form.district}
                  onChange={(e) => updateForm({ district: e.target.value })}
                />
              </Field>
              <Field label="State *">
                <input
                  className={inputClass}
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => updateForm({ state: e.target.value })}
                />
              </Field>
              <Field label="PIN">
                <input
                  className={inputClass}
                  placeholder="XXXXXX"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => updateForm({ pincode: e.target.value })}
                />
              </Field>
            </div>

            {/* Template-specific extra fields */}
            {template.extraFields.length > 0 && (
              <>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {template.label} — Additional Details
                </p>
                {template.extraFields.map((f) =>
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
              Court / Notary
            </p>

            <Field label="Court / Notary Name &amp; Address">
              <input
                className={inputClass}
                placeholder="e.g. Notary Public, District Court, Agra"
                value={form.courtOrNotary}
                onChange={(e) => updateForm({ courtOrNotary: e.target.value })}
              />
            </Field>

            <div className="flex gap-2">
              <Field label="Place *">
                <input
                  className={inputClass}
                  placeholder="City / Town"
                  value={form.place}
                  onChange={(e) => updateForm({ place: e.target.value })}
                />
              </Field>
              <Field label="Date *">
                <input
                  className={inputClass}
                  type="text"
                  placeholder="DD Month YYYY"
                  value={form.date}
                  onChange={(e) => updateForm({ date: e.target.value })}
                />
              </Field>
            </div>

            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Declaration Text (editable)
            </p>

            <Field label="Declaration paragraphs">
              <textarea
                className={inputClass}
                rows={10}
                value={form.declarationText}
                onChange={(e) => updateForm({ declarationText: e.target.value })}
              />
            </Field>

            <Button
              className="mt-2 w-full gap-2"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print / Save as PDF
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              In print dialog → choose "Save as PDF" to get a PDF file.
            </p>
          </div>
        </section>

        {/* ── Preview panel ─────────────────────────────────────────────── */}
        <section
          id="affidavit-preview-panel"
          className="flex-1 overflow-x-auto"
        >
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            Live preview — updates as you type
          </div>
          <AffidavitPreview form={form} template={template} />
        </section>
      </div>
    </>
  );
}
