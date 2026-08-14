"use client";

import { useRef, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

interface MetadataFields {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
}

const EMPTY_FIELDS: MetadataFields = {
  title: "",
  author: "",
  subject: "",
  keywords: "",
  creator: "",
};

const FIELD_LABELS: Record<keyof MetadataFields, string> = {
  title: "Title",
  author: "Author",
  subject: "Subject",
  keywords: "Keywords",
  creator: "Creator",
};

const FIELD_PLACEHOLDERS: Record<keyof MetadataFields, string> = {
  title: "Document title",
  author: "Author name",
  subject: "Subject or description",
  keywords: "comma, separated, keywords",
  creator: "Application that created the PDF",
};

export function PdfMetadataForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fields, setFields] = useState<MetadataFields>(EMPTY_FIELDS);
  const [loaded, setLoaded] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const loadFile = async (incoming: File) => {
    if (incoming.type !== "application/pdf" && !incoming.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please select a PDF file.");
      return;
    }
    setIsLoading(true);
    setLoaded(false);
    setFields(EMPTY_FIELDS);

    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const arrayBuffer = await incoming.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);

      setFields({
        title: doc.getTitle() ?? "",
        author: doc.getAuthor() ?? "",
        subject: doc.getSubject() ?? "",
        keywords: doc.getKeywords() ?? "",
        creator: doc.getCreator() ?? "",
      });
      setFile(incoming);
      setLoaded(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read this PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0] ?? null;
    if (dropped) void loadFile(dropped);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    if (picked) void loadFile(picked);
  };

  const handleSave = async () => {
    if (!file) return;

    fire("process_start", { tool_id: "pdf-metadata" });
    setIsSaving(true);

    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);

      doc.setTitle(fields.title);
      doc.setAuthor(fields.author);
      doc.setSubject(fields.subject);
      doc.setKeywords([fields.keywords]);
      doc.setCreator(fields.creator);

      const bytes = await doc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filename = `metadata-${file.name}`;

      fire("download_click", { tool_id: "pdf-metadata", output_type: "application/pdf" });

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("PDF saved with updated metadata.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the PDF.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartOver = () => {
    setFile(null);
    setLoaded(false);
    setFields(EMPTY_FIELDS);
    if (inputRef.current) inputRef.current.value = "";
  };

  const setField = (key: keyof MetadataFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop PDF here or click to browse"
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors ${
          isDragging
            ? "border-primary-500 bg-primary-500/5"
            : "border-surface-border bg-surface-2 hover:border-primary-500/60"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={onInputChange}
        />
        {isLoading ? (
          <p className="text-body-sm text-surface-fg-muted">Reading metadata…</p>
        ) : file ? (
          <div className="text-center">
            <p className="font-medium text-surface-fg">{file.name}</p>
            <p className="text-body-sm text-surface-fg-muted">{formatBytes(file.size)}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium text-surface-fg">Drop your PDF here</p>
            <p className="text-body-sm text-surface-fg-muted">or click to browse</p>
          </div>
        )}
      </div>

      {/* Metadata fields */}
      {loaded && (
        <>
          <div className="space-y-4">
            <p className="text-body-sm font-medium text-surface-fg">Edit metadata fields</p>
            <div className="grid gap-4">
              {(Object.keys(FIELD_LABELS) as (keyof MetadataFields)[]).map((key) => (
                <div key={key} className="space-y-1.5">
                  <label
                    htmlFor={`meta-${key}`}
                    className="block text-body-sm font-medium text-surface-fg"
                  >
                    {FIELD_LABELS[key]}
                  </label>
                  <input
                    id={`meta-${key}`}
                    type="text"
                    value={fields[key]}
                    onChange={setField(key)}
                    placeholder={FIELD_PLACEHOLDERS[key]}
                    className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save & Download PDF"}
            </Button>
            <Button variant="soft" onClick={handleStartOver} disabled={isSaving}>
              Start over
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
