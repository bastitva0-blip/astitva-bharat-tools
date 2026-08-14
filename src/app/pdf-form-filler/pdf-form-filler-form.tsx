"use client";

import { useRef, useState } from "react";
import { Upload, Check, FileText } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type FieldType = "TextField" | "CheckBox" | "RadioGroup" | "Dropdown" | "OptionList" | "Unknown";

interface PdfField {
  name: string;
  type: FieldType;
  options?: string[];
}

export function PdfFormFillerForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<PdfField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string | boolean>>({});
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>("");

  function handleFile(f: File) {
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are accepted.");
      return;
    }
    setFile(f);
    setFields([]);
    setFieldValues({});
    setDone(false);
    setDownloadUrl(null);
    setDownloadName("");
    parsePdf(f);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function parsePdf(f: File) {
    setParsing(true);
    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const arrayBuffer = await f.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const form = pdfDoc.getForm();
      const rawFields = form.getFields();

      if (rawFields.length === 0) {
        toast.info("This PDF has no fillable form fields.");
        setFields([]);
        setParsing(false);
        return;
      }

      const detected: PdfField[] = rawFields.map((field) => {
        const name = field.getName();
        const constructor = field.constructor.name as string;

        let type: FieldType = "Unknown";
        if (constructor.includes("TextField")) type = "TextField";
        else if (constructor.includes("CheckBox")) type = "CheckBox";
        else if (constructor.includes("RadioGroup")) type = "RadioGroup";
        else if (constructor.includes("Dropdown")) type = "Dropdown";
        else if (constructor.includes("OptionList")) type = "OptionList";

        let options: string[] | undefined;
        try {
          if (type === "RadioGroup" || type === "Dropdown" || type === "OptionList") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options = (field as any).getOptions?.() ?? [];
          }
        } catch {
          options = [];
        }

        return { name, type, options };
      });

      const initialValues: Record<string, string | boolean> = {};
      detected.forEach((f) => {
        initialValues[f.name] = f.type === "CheckBox" ? false : "";
      });

      setFields(detected);
      setFieldValues(initialValues);
    } catch {
      toast.error("Could not read PDF fields. Make sure it is a valid PDF file.");
    } finally {
      setParsing(false);
    }
  }

  function setValue(name: string, value: string | boolean) {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
  }

  async function fillAndDownload() {
    if (!file) return;
    setLoading(true);
    fire("process_start", { tool_id: "pdf-form-filler" });
    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const form = pdfDoc.getForm();

      for (const field of fields) {
        const val = fieldValues[field.name];
        try {
          if (field.type === "TextField") {
            form.getTextField(field.name).setText(String(val ?? ""));
          } else if (field.type === "CheckBox") {
            if (val) {
              form.getCheckBox(field.name).check();
            } else {
              form.getCheckBox(field.name).uncheck();
            }
          } else if (field.type === "Dropdown") {
            if (val && String(val)) {
              form.getDropdown(field.name).select(String(val));
            }
          } else if (field.type === "RadioGroup") {
            if (val && String(val)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (form as any).getRadioGroup(field.name).select(String(val));
            }
          } else if (field.type === "OptionList") {
            if (val && String(val)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (form as any).getOptionList(field.name).select(String(val));
            }
          }
        } catch {
          // skip fields that can't be set
        }
      }

      form.flatten();
      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const name = `filled-${file.name}`;
      setDownloadUrl(url);
      setDownloadName(name);
      setDone(true);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      fire("download_click", { tool_id: "pdf-form-filler", output_type: "application/pdf" });
    } catch {
      toast.error("Could not fill PDF. Make sure the file is a valid PDF with form fields.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setFields([]);
    setFieldValues({});
    setDone(false);
    setDownloadUrl(null);
    setDownloadName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  // Success state
  if (done && downloadUrl) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-surface-border bg-surface px-8 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="size-6 text-green-600 dark:text-green-400" aria-hidden />
        </div>
        <div>
          <p className="text-body-md font-semibold text-surface-fg">PDF filled successfully</p>
          <p className="mt-1 text-body-sm text-surface-fg-muted">
            Your download should have started automatically.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="solid"
            size="md"
            onClick={() => {
              const a = document.createElement("a");
              a.href = downloadUrl;
              a.download = downloadName;
              a.click();
              fire("download_click", { tool_id: "pdf-form-filler", output_type: "application/pdf" });
            }}
          >
            <FileText className="size-4" aria-hidden />
            Download again
          </Button>
          <Button variant="ghost" size="md" onClick={reset}>
            Fill another PDF
          </Button>
        </div>
      </div>
    );
  }

  // Drop zone
  if (!file) {
    return (
      <div className="flex flex-col gap-6">
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload PDF file"
          className="flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-surface-border bg-surface px-8 py-12 text-center transition hover:border-[var(--bt-saffron-ink)] hover:bg-[var(--bt-saffron-ink)]/5"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-surface-raised">
            <Upload className="size-6 text-surface-fg-muted" aria-hidden />
          </div>
          <div>
            <p className="text-body-md font-semibold text-surface-fg">Drop your PDF here</p>
            <p className="mt-1 text-body-sm text-surface-fg-muted">
              or click to browse — PDF files only
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={handleInputChange}
            aria-hidden
          />
        </div>
      </div>
    );
  }

  // Parsing state
  if (parsing) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-surface-border bg-surface px-8 py-12 text-center">
        <div className="size-8 animate-spin rounded-full border-2 border-surface-border border-t-[var(--bt-saffron-ink)]" />
        <p className="text-body-sm text-surface-fg-muted">Reading form fields…</p>
      </div>
    );
  }

  // Form filling state
  return (
    <div className="flex flex-col gap-6">
      {/* File info */}
      <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-raised">
          <FileText className="size-4 text-surface-fg-muted" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm font-medium text-surface-fg">{file.name}</p>
          <p className="text-body-xs text-surface-fg-muted">{formatBytes(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="shrink-0 text-body-xs text-surface-fg-muted underline underline-offset-2 hover:text-surface-fg"
        >
          Remove
        </button>
      </div>

      {/* Field count */}
      {fields.length > 0 && (
        <div className="rounded-xl border border-surface-border bg-surface-raised px-4 py-3">
          <p className="text-body-sm text-surface-fg-muted">
            Found <span className="font-semibold text-surface-fg">{fields.length}</span> fillable{" "}
            {fields.length === 1 ? "field" : "fields"}
          </p>
        </div>
      )}

      {/* Field list */}
      {fields.length > 0 && (
        <div className="flex flex-col gap-4">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label
                htmlFor={`field-${field.name}`}
                className="text-body-sm font-medium text-surface-fg"
              >
                {field.name}
                <span className="ml-2 text-body-xs font-normal text-surface-fg-muted">
                  ({field.type})
                </span>
              </label>

              {field.type === "TextField" && (
                <input
                  id={`field-${field.name}`}
                  type="text"
                  value={String(fieldValues[field.name] ?? "")}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-body-sm text-surface-fg placeholder:text-surface-fg-muted focus:outline-none focus:ring-2 focus:ring-[var(--bt-saffron-ink)]/40"
                  placeholder={`Enter ${field.name}`}
                />
              )}

              {field.type === "CheckBox" && (
                <div className="flex items-center gap-2">
                  <input
                    id={`field-${field.name}`}
                    type="checkbox"
                    checked={Boolean(fieldValues[field.name])}
                    onChange={(e) => setValue(field.name, e.target.checked)}
                    className="size-4 rounded border-surface-border text-[var(--bt-saffron-ink)] focus:ring-[var(--bt-saffron-ink)]/40"
                  />
                  <span className="text-body-sm text-surface-fg-muted">Check this field</span>
                </div>
              )}

              {field.type === "RadioGroup" && field.options && field.options.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {field.options.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`field-${field.name}`}
                        value={opt}
                        checked={fieldValues[field.name] === opt}
                        onChange={() => setValue(field.name, opt)}
                        className="size-4 border-surface-border text-[var(--bt-saffron-ink)] focus:ring-[var(--bt-saffron-ink)]/40"
                      />
                      <span className="text-body-sm text-surface-fg">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {(field.type === "Dropdown" || field.type === "OptionList") &&
                field.options &&
                field.options.length > 0 && (
                  <select
                    id={`field-${field.name}`}
                    value={String(fieldValues[field.name] ?? "")}
                    onChange={(e) => setValue(field.name, e.target.value)}
                    className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-[var(--bt-saffron-ink)]/40"
                  >
                    <option value="">Select an option</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Action */}
      <Button
        variant="solid"
        size="lg"
        disabled={loading || fields.length === 0}
        onClick={fillAndDownload}
        className="w-full"
      >
        <FileText className="size-4" aria-hidden />
        {loading ? "Filling PDF…" : "Fill & Download"}
      </Button>

      <p className="text-center text-body-xs text-surface-fg-muted">
        All processing happens in your browser — your file is never uploaded.
      </p>
    </div>
  );
}
