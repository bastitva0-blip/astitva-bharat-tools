"use client";

import { useState } from "react";
import { Printer, FileText } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { fire } from "@/lib/analytics/events";

// ─── Types ────────────────────────────────────────────────────────────────────

type CertMode = "student" | "employee";

interface FormState {
  mode: CertMode;
  // Institution
  institutionName: string;
  institutionAddress: string;
  institutionContact: string;
  // Officer
  officerName: string;
  officerDesignation: string;
  // Subject
  subjectName: string;
  subjectId: string;
  // Student-specific
  course: string;
  department: string;
  yearBatch: string;
  // Employee-specific
  empDesignation: string;
  empDepartment: string;
  // Shared
  purpose: string;
  customPurpose: string;
  validFrom: string;
  validTo: string;
  academicYear: string;
  place: string;
  dateOfIssue: string;
}

const PURPOSES_STUDENT = [
  "Opening a bank account",
  "Scholarship application",
  "Visa application",
  "Admission to higher studies",
  "Educational loan",
  "Government scheme application",
  "Railway concession",
  "Other",
];

const PURPOSES_EMPLOYEE = [
  "Opening a bank account",
  "Visa application",
  "Loan application",
  "Housing society membership",
  "Government document",
  "Other",
];

function today(): string {
  return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function currentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  // Academic year starts in June/July
  return month >= 6 ? `${year}–${year + 1}` : `${year - 1}–${year}`;
}

function defaultForm(): FormState {
  return {
    mode: "student",
    institutionName: "",
    institutionAddress: "",
    institutionContact: "",
    officerName: "",
    officerDesignation: "Principal",
    subjectName: "",
    subjectId: "",
    course: "",
    department: "",
    yearBatch: "",
    empDesignation: "",
    empDepartment: "",
    purpose: "Opening a bank account",
    customPurpose: "",
    validFrom: "",
    validTo: "",
    academicYear: currentAcademicYear(),
    place: "",
    dateOfIssue: today(),
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

// ─── Certificate Preview ──────────────────────────────────────────────────────

function CertificatePreview({ form }: { form: FormState }) {
  const purpose = form.purpose === "Other" ? form.customPurpose || "_______________" : form.purpose;

  const studentBody = `This is to certify that ${form.subjectName || "_______________"}${form.subjectId ? `, bearing Roll No. / ID: ${form.subjectId},` : ""} is a bonafide student of this institution${form.course ? `, enrolled in the ${form.course}` : ""}${form.department ? ` (Department of ${form.department})` : ""}${form.yearBatch ? `, ${form.yearBatch}` : ""}${form.academicYear ? ` for the academic year ${form.academicYear}` : ""}.`;

  const employeeBody = `This is to certify that ${form.subjectName || "_______________"}${form.subjectId ? ` (Employee ID: ${form.subjectId})` : ""} is a bonafide employee of this organisation${form.empDesignation ? `, working as ${form.empDesignation}` : ""}${form.empDepartment ? ` in the ${form.empDepartment} Department` : ""}.`;

  const body = form.mode === "student" ? studentBody : employeeBody;

  const validityLine =
    form.validFrom && form.validTo
      ? `This certificate is valid from ${form.validFrom} to ${form.validTo}.`
      : "";

  return (
    <div
      id="bonafide-preview"
      className="bonafide-paper mx-auto bg-white text-black"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm 18mm 18mm",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "13px",
        lineHeight: "1.8",
        border: "1px solid #ccc",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Institution letterhead */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#1a1a5e",
          }}
        >
          {form.institutionName || "Institution / Company Name"}
        </div>
        {form.institutionAddress && (
          <div style={{ fontSize: "12px", color: "#333", marginTop: "4px", whiteSpace: "pre-line" }}>
            {form.institutionAddress}
          </div>
        )}
        {form.institutionContact && (
          <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
            {form.institutionContact}
          </div>
        )}
      </div>

      <hr style={{ border: "none", borderTop: "2px solid #1a1a5e", margin: "10px 0" }} />
      <hr style={{ border: "none", borderTop: "1px solid #1a1a5e", margin: "3px 0 16px" }} />

      {/* Certificate title */}
      <div
        style={{
          textAlign: "center",
          fontSize: "16px",
          fontWeight: "bold",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          textDecoration: "underline",
          marginBottom: "20px",
        }}
      >
        BONAFIDE CERTIFICATE
      </div>

      {/* Ref and date row */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "16px" }}>
        <div>Ref. No.: _______________</div>
        <div>Date: {form.dateOfIssue || "_______________"}</div>
      </div>

      {/* Body */}
      <p style={{ textAlign: "justify", marginBottom: "14px", fontSize: "13px" }}>
        {`To Whomsoever It May Concern,`}
      </p>

      <p style={{ textAlign: "justify", marginBottom: "14px", fontSize: "13px" }}>
        {body}
      </p>

      <p style={{ textAlign: "justify", marginBottom: "14px", fontSize: "13px" }}>
        {`This certificate is being issued at the request of the ${form.mode === "student" ? "student" : "employee"} for the purpose of `}
        <strong>{purpose}</strong>
        {`.`}
      </p>

      {validityLine && (
        <p style={{ textAlign: "justify", marginBottom: "14px", fontSize: "13px" }}>
          {validityLine}
        </p>
      )}

      <p style={{ textAlign: "justify", marginBottom: "14px", fontSize: "13px" }}>
        {`We wish ${form.subjectName || "him/her"} all the best in ${form.mode === "student" ? "his/her studies" : "his/her endeavours"}.`}
      </p>

      {/* Signature block */}
      <div style={{ marginTop: "50px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ minWidth: "160px" }}>
          <div style={{ borderTop: "1px solid #333", width: "180px", marginBottom: "4px" }} />
          <div style={{ fontSize: "12px", fontWeight: "bold" }}>
            {form.officerName || "Authorised Signatory"}
          </div>
          <div style={{ fontSize: "11px", color: "#444" }}>
            {form.officerDesignation || "Designation"}
          </div>
          <div style={{ fontSize: "11px", color: "#444" }}>
            {form.institutionName || "Institution / Organisation"}
          </div>
        </div>

        <div style={{ textAlign: "center", minWidth: "120px" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              border: "1px dashed #aaa",
              borderRadius: "50%",
              margin: "0 auto 4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "#999",
            }}
          >
            Official Seal
          </div>
        </div>
      </div>

      <div style={{ marginTop: "16px", fontSize: "11px", color: "#555" }}>
        Place: {form.place || "_______________"} &nbsp;&nbsp; Date: {form.dateOfIssue || "_______________"}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BonafideCertificateForm() {
  const [form, setForm] = useState<FormState>(defaultForm);

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function handlePrint() {
    fire("process_start", { tool_id: "bonafide-certificate" });
    window.print();
  }

  const purposes = form.mode === "student" ? PURPOSES_STUDENT : PURPOSES_EMPLOYEE;

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #bonafide-root { display: block !important; }
          #bonafide-form-panel { display: none !important; }
          #bonafide-preview-panel { display: block !important; width: 100% !important; padding: 0 !important; }
          #bonafide-preview { box-shadow: none !important; border: 1px solid #ccc !important; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      <div id="bonafide-root" className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* ── Form panel ───────────────────────────────────────────────── */}
        <section
          id="bonafide-form-panel"
          className="w-full rounded-xl border border-border bg-card p-6 lg:max-w-[420px] lg:sticky lg:top-8"
        >
          {/* Mode toggle */}
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Certificate Type
            </p>
            <div className="flex gap-2">
              {(["student", "employee"] as CertMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => update({ mode: m, purpose: m === "student" ? PURPOSES_STUDENT[0] : PURPOSES_EMPLOYEE[0] })}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                    form.mode === m
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Institution */}
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Institution / Organisation Details
            </p>

            <Field label="Institution / Company Name *">
              <input
                className={inputClass}
                placeholder="e.g. St. Xavier's College, Ahmedabad"
                value={form.institutionName}
                onChange={(e) => update({ institutionName: e.target.value })}
              />
            </Field>

            <Field label="Address">
              <textarea
                className={inputClass}
                rows={2}
                placeholder="Street, City, State, PIN"
                value={form.institutionAddress}
                onChange={(e) => update({ institutionAddress: e.target.value })}
              />
            </Field>

            <Field label="Contact (Phone / Email)">
              <input
                className={inputClass}
                placeholder="e.g. +91 79 2600 1234 | info@college.edu.in"
                value={form.institutionContact}
                onChange={(e) => update({ institutionContact: e.target.value })}
              />
            </Field>

            {/* Officer */}
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Certifying Officer
            </p>

            <div className="flex gap-2">
              <Field label="Officer Name *">
                <input
                  className={inputClass}
                  placeholder="Full name"
                  value={form.officerName}
                  onChange={(e) => update({ officerName: e.target.value })}
                />
              </Field>
              <Field label="Designation *">
                <input
                  className={inputClass}
                  placeholder="e.g. Principal"
                  value={form.officerDesignation}
                  onChange={(e) => update({ officerDesignation: e.target.value })}
                />
              </Field>
            </div>

            {/* Subject */}
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {form.mode === "student" ? "Student Details" : "Employee Details"}
            </p>

            <Field label={form.mode === "student" ? "Student Name *" : "Employee Name *"}>
              <input
                className={inputClass}
                placeholder="Full name"
                value={form.subjectName}
                onChange={(e) => update({ subjectName: e.target.value })}
              />
            </Field>

            <Field label={form.mode === "student" ? "Roll No. / Student ID" : "Employee ID"}>
              <input
                className={inputClass}
                placeholder={form.mode === "student" ? "e.g. 2023CS042" : "e.g. EMP-1042"}
                value={form.subjectId}
                onChange={(e) => update({ subjectId: e.target.value })}
              />
            </Field>

            {form.mode === "student" ? (
              <>
                <Field label="Course *">
                  <input
                    className={inputClass}
                    placeholder="e.g. B.Tech Computer Science, B.A. Economics"
                    value={form.course}
                    onChange={(e) => update({ course: e.target.value })}
                  />
                </Field>
                <div className="flex gap-2">
                  <Field label="Department">
                    <input
                      className={inputClass}
                      placeholder="e.g. Science"
                      value={form.department}
                      onChange={(e) => update({ department: e.target.value })}
                    />
                  </Field>
                  <Field label="Year / Batch">
                    <input
                      className={inputClass}
                      placeholder="e.g. 2nd Year"
                      value={form.yearBatch}
                      onChange={(e) => update({ yearBatch: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Academic Year">
                  <input
                    className={inputClass}
                    placeholder="e.g. 2024–2025"
                    value={form.academicYear}
                    onChange={(e) => update({ academicYear: e.target.value })}
                  />
                </Field>
              </>
            ) : (
              <div className="flex gap-2">
                <Field label="Designation *">
                  <input
                    className={inputClass}
                    placeholder="e.g. Senior Engineer"
                    value={form.empDesignation}
                    onChange={(e) => update({ empDesignation: e.target.value })}
                  />
                </Field>
                <Field label="Department">
                  <input
                    className={inputClass}
                    placeholder="e.g. Finance"
                    value={form.empDepartment}
                    onChange={(e) => update({ empDepartment: e.target.value })}
                  />
                </Field>
              </div>
            )}

            {/* Purpose */}
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Purpose &amp; Validity
            </p>

            <Field label="Purpose *">
              <select
                className={inputClass}
                value={form.purpose}
                onChange={(e) => update({ purpose: e.target.value })}
              >
                {purposes.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>

            {form.purpose === "Other" && (
              <Field label="Specify Purpose">
                <input
                  className={inputClass}
                  placeholder="Describe the purpose"
                  value={form.customPurpose}
                  onChange={(e) => update({ customPurpose: e.target.value })}
                />
              </Field>
            )}

            <div className="flex gap-2">
              <Field label="Valid From">
                <input
                  className={inputClass}
                  type="text"
                  placeholder="e.g. 01 June 2024"
                  value={form.validFrom}
                  onChange={(e) => update({ validFrom: e.target.value })}
                />
              </Field>
              <Field label="Valid To">
                <input
                  className={inputClass}
                  type="text"
                  placeholder="e.g. 31 May 2025"
                  value={form.validTo}
                  onChange={(e) => update({ validTo: e.target.value })}
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
              <Field label="Date of Issue *">
                <input
                  className={inputClass}
                  type="text"
                  placeholder="DD Month YYYY"
                  value={form.dateOfIssue}
                  onChange={(e) => update({ dateOfIssue: e.target.value })}
                />
              </Field>
            </div>

            <Button className="mt-2 w-full gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print / Save as PDF
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              In print dialog → choose "Save as PDF" to get a PDF file.
            </p>
          </div>
        </section>

        {/* ── Preview panel ─────────────────────────────────────────────── */}
        <section id="bonafide-preview-panel" className="flex-1 overflow-x-auto">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            Live preview — updates as you type
          </div>
          <CertificatePreview form={form} />
        </section>
      </div>
    </>
  );
}
