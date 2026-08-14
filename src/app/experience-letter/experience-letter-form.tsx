"use client";

import { useState } from "react";
import { Printer, FileText } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { fire } from "@/lib/analytics/events";

// ─── Types ────────────────────────────────────────────────────────────────────

type Pronoun = "he/him" | "she/her" | "they/them";

interface FormState {
  // Company
  companyName: string;
  letterheadName: string;
  companyAddress: string;
  // Employee
  employeeName: string;
  designation: string;
  department: string;
  joinDate: string;
  lastWorkingDate: string;
  reasonForLeaving: string;
  pronoun: Pronoun;
  // Signatory
  signatoryName: string;
  signatoryDesignation: string;
  // Misc
  city: string;
  issueDate: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "_______________";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function calcTenure(joinDateStr: string, lastDateStr: string): string {
  if (!joinDateStr || !lastDateStr) return "";
  const start = new Date(joinDateStr);
  const end = new Date(lastDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return "";
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  if (months < 0) { years -= 1; months += 12; }
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? "s" : ""}`);
  return parts.length > 0 ? parts.join(" ") : "less than a month";
}

function pronounSubject(p: Pronoun): string {
  if (p === "she/her") return "she";
  if (p === "they/them") return "they";
  return "he";
}

function pronounObject(p: Pronoun): string {
  if (p === "she/her") return "her";
  if (p === "they/them") return "them";
  return "him";
}

function pronounPossessive(p: Pronoun): string {
  if (p === "she/her") return "her";
  if (p === "they/them") return "their";
  return "his";
}

function pronounWish(p: Pronoun): string {
  if (p === "she/her") return "her";
  if (p === "they/them") return "them";
  return "him";
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

function ExperienceLetterPreview({ form }: { form: FormState }) {
  const tenure = calcTenure(form.joinDate, form.lastWorkingDate);
  const subj = pronounSubject(form.pronoun);
  const obj = pronounObject(form.pronoun);
  const poss = pronounPossessive(form.pronoun);
  const wish = pronounWish(form.pronoun);

  void obj;

  const Subjc = subj.charAt(0).toUpperCase() + subj.slice(1);

  const tenurePhrase = tenure ? ` During ${Subjc === "They" ? "their" : poss} tenure of ${tenure},` : "";

  return (
    <div
      id="experience-letter-preview"
      className="experience-letter-paper mx-auto bg-white text-black"
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
      {/* Letterhead */}
      <div style={{ textAlign: "center", marginBottom: "24px", borderBottom: "2px solid #1a3a5e", paddingBottom: "12px" }}>
        <div style={{ fontSize: "22px", fontWeight: "bold", letterSpacing: "0.05em", textTransform: "uppercase", color: "#1a3a5e" }}>
          {form.letterheadName || form.companyName || "COMPANY NAME"}
        </div>
        {form.companyAddress && (
          <div style={{ fontSize: "11px", color: "#555", marginTop: "4px", whiteSpace: "pre-line" }}>
            {form.companyAddress}
          </div>
        )}
      </div>

      {/* Date & Ref */}
      <div style={{ marginBottom: "16px", fontSize: "12px", color: "#333" }}>
        <strong>Date:</strong> {form.issueDate || today()}
        {form.city && (
          <span style={{ marginLeft: "24px" }}>
            <strong>Place:</strong> {form.city}
          </span>
        )}
      </div>

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "15px", fontWeight: "bold", letterSpacing: "0.15em", textDecoration: "underline", textTransform: "uppercase" }}>
          TO WHOM IT MAY CONCERN
        </div>
      </div>

      {/* Subject */}
      <div style={{ marginBottom: "16px", fontSize: "13px" }}>
        <strong>Sub: Experience Certificate — {form.employeeName || "_______________"}</strong>
      </div>

      {/* Body */}
      <p style={{ textAlign: "justify", marginBottom: "14px" }}>
        This is to certify that{" "}
        <strong>{form.employeeName || "_______________"}</strong> was employed with{" "}
        <strong>{form.companyName || "_______________"}</strong> as{" "}
        <strong>{form.designation || "_______________"}</strong>
        {form.department ? (
          <> in the <strong>{form.department}</strong> department</>
        ) : null}{" "}
        from <strong>{formatDate(form.joinDate)}</strong> to{" "}
        <strong>{formatDate(form.lastWorkingDate)}</strong>.{tenurePhrase} {Subjc} performed{" "}
        {poss} duties diligently and with full dedication. {Subjc} was found to be punctual,
        sincere, and a hardworking team member.
      </p>

      {form.reasonForLeaving && (
        <p style={{ textAlign: "justify", marginBottom: "14px" }}>
          {form.employeeName ? form.employeeName.split(" ")[0] : "The employee"} has left the organisation{" "}
          {form.reasonForLeaving}.
        </p>
      )}

      <p style={{ textAlign: "justify", marginBottom: "14px" }}>
        During {poss} association with {form.companyName || "the company"},{" "}
        {subj} demonstrated excellent professional conduct and contributed positively to the
        organisation&apos;s objectives. {Subjc} leaves with a clean record and our best wishes.
      </p>

      <p style={{ textAlign: "justify", marginBottom: "30px" }}>
        We wish {wish} all the best in {poss} future endeavours.
      </p>

      {/* Signature block */}
      <div style={{ marginTop: "48px" }}>
        <div style={{ borderTop: "1px solid #333", width: "180px", marginBottom: "6px" }} />
        <div style={{ fontSize: "13px", fontWeight: "bold" }}>
          {form.signatoryName || "Authorised Signatory"}
        </div>
        {form.signatoryDesignation && (
          <div style={{ fontSize: "12px", color: "#333" }}>{form.signatoryDesignation}</div>
        )}
        <div style={{ fontSize: "12px", color: "#333" }}>
          {form.companyName || "Company Name"}
        </div>
        <div style={{ fontSize: "12px", color: "#333", marginTop: "4px" }}>
          {form.city ? `${form.city}, ` : ""}{form.issueDate || today()}
        </div>
      </div>

      {/* Company seal placeholder */}
      <div
        style={{
          position: "absolute",
          bottom: "28mm",
          right: "20mm",
          width: "90px",
          height: "90px",
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
        Company<br />Seal
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const defaultForm: FormState = {
  companyName: "",
  letterheadName: "",
  companyAddress: "",
  employeeName: "",
  designation: "",
  department: "",
  joinDate: "",
  lastWorkingDate: "",
  reasonForLeaving: "",
  pronoun: "he/him",
  signatoryName: "",
  signatoryDesignation: "",
  city: "",
  issueDate: today(),
};

export function ExperienceLetterForm() {
  const [form, setForm] = useState<FormState>(defaultForm);

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function handlePrint() {
    fire("process_start", { tool_id: "experience-letter" });
    fire("download_click", { tool_id: "experience-letter", output_type: "application/pdf" });
    window.print();
  }

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #exp-letter-root { display: block !important; }
          #exp-letter-form-panel { display: none !important; }
          #exp-letter-preview-panel { display: block !important; width: 100% !important; padding: 0 !important; }
          #experience-letter-preview { box-shadow: none !important; border: 1px solid #ccc !important; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      <div id="exp-letter-root" className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* ── Form panel ───────────────────────────────────────────────── */}
        <section
          id="exp-letter-form-panel"
          className="w-full rounded-xl border border-border bg-card p-6 lg:max-w-[420px] lg:sticky lg:top-8"
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Company Details
            </p>

            <Field label="Company Name *">
              <input
                className={inputClass}
                placeholder="e.g. Acme Pvt. Ltd."
                value={form.companyName}
                onChange={(e) => update({ companyName: e.target.value })}
              />
            </Field>

            <Field label="Letterhead Name (if different)">
              <input
                className={inputClass}
                placeholder="Name to show at the top of letter"
                value={form.letterheadName}
                onChange={(e) => update({ letterheadName: e.target.value })}
              />
            </Field>

            <Field label="Company Address">
              <textarea
                className={inputClass}
                rows={2}
                placeholder="Full address, city, pin code"
                value={form.companyAddress}
                onChange={(e) => update({ companyAddress: e.target.value })}
              />
            </Field>

            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Employee Details
            </p>

            <Field label="Employee Full Name *">
              <input
                className={inputClass}
                placeholder="As per records"
                value={form.employeeName}
                onChange={(e) => update({ employeeName: e.target.value })}
              />
            </Field>

            <div className="flex gap-2">
              <Field label="Designation *">
                <input
                  className={inputClass}
                  placeholder="e.g. Software Engineer"
                  value={form.designation}
                  onChange={(e) => update({ designation: e.target.value })}
                />
              </Field>
              <Field label="Department">
                <input
                  className={inputClass}
                  placeholder="e.g. Engineering"
                  value={form.department}
                  onChange={(e) => update({ department: e.target.value })}
                />
              </Field>
            </div>

            <div className="flex gap-2">
              <Field label="Joining Date *">
                <input
                  className={inputClass}
                  type="date"
                  value={form.joinDate}
                  onChange={(e) => update({ joinDate: e.target.value })}
                />
              </Field>
              <Field label="Last Working Date *">
                <input
                  className={inputClass}
                  type="date"
                  value={form.lastWorkingDate}
                  onChange={(e) => update({ lastWorkingDate: e.target.value })}
                />
              </Field>
            </div>

            {form.joinDate && form.lastWorkingDate && calcTenure(form.joinDate, form.lastWorkingDate) && (
              <p className="text-xs text-muted-foreground">
                Tenure: <strong>{calcTenure(form.joinDate, form.lastWorkingDate)}</strong>
              </p>
            )}

            <Field label="Pronoun">
              <select
                className={inputClass}
                value={form.pronoun}
                onChange={(e) => update({ pronoun: e.target.value as Pronoun })}
              >
                <option value="he/him">He / Him</option>
                <option value="she/her">She / Her</option>
                <option value="they/them">They / Them</option>
              </select>
            </Field>

            <Field label="Reason for Leaving (optional)">
              <input
                className={inputClass}
                placeholder="e.g. to pursue higher studies, for personal reasons"
                value={form.reasonForLeaving}
                onChange={(e) => update({ reasonForLeaving: e.target.value })}
              />
            </Field>

            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Signatory &amp; Issue Details
            </p>

            <div className="flex gap-2">
              <Field label="Signatory Name *">
                <input
                  className={inputClass}
                  placeholder="e.g. Rahul Sharma"
                  value={form.signatoryName}
                  onChange={(e) => update({ signatoryName: e.target.value })}
                />
              </Field>
              <Field label="Signatory Designation">
                <input
                  className={inputClass}
                  placeholder="e.g. HR Manager"
                  value={form.signatoryDesignation}
                  onChange={(e) => update({ signatoryDesignation: e.target.value })}
                />
              </Field>
            </div>

            <div className="flex gap-2">
              <Field label="City *">
                <input
                  className={inputClass}
                  placeholder="e.g. Mumbai"
                  value={form.city}
                  onChange={(e) => update({ city: e.target.value })}
                />
              </Field>
              <Field label="Date of Issue *">
                <input
                  className={inputClass}
                  type="text"
                  placeholder="DD Month YYYY"
                  value={form.issueDate}
                  onChange={(e) => update({ issueDate: e.target.value })}
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
        <section id="exp-letter-preview-panel" className="flex-1 overflow-x-auto">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            Live preview — updates as you type
          </div>
          <ExperienceLetterPreview form={form} />
        </section>
      </div>
    </>
  );
}
