"use client";

import { useCallback, useRef, useState } from "react";
import { Archive, Check, Download, File, Folder, Trash2, Upload } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── types ─────────────────────────────────────────────────────────────────────

interface ZipEntry {
  name: string;
  size: number;
  isDir: boolean;
}

// ── Create ZIP tab ────────────────────────────────────────────────────────────

function CreateZipTab() {
  const [files, setFiles] = useState<File[]>([]);
  const [folderName, setFolderName] = useState("");
  const [zipName, setZipName] = useState("archive");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSize = files.reduce((a, f) => a + f.size, 0);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    setDone(false);
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const toAdd = Array.from(incoming).filter((f) => !names.has(f.name));
      return [...prev, ...toAdd];
    });
  }, []);

  const removeFile = (idx: number) => {
    setDone(false);
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const handleCreate = async () => {
    if (files.length === 0) {
      toast.error("Add at least one file.");
      return;
    }
    fire("process_start", { tool_id: "zip-tool" });
    setBusy(true);
    setDone(false);
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — jszip installed at build time, types via @types/jszip
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const prefix = folderName.trim() ? `${folderName.trim()}/` : "";
      for (const file of files) {
        zip.file(`${prefix}${file.name}`, file);
      }
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${zipName.trim() || "archive"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      fire("download_click", { tool_id: "zip-tool", output_type: "application/zip" });
      setDone(true);
      toast.success("ZIP downloaded.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create ZIP. Check browser console.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-surface-border p-10 text-center transition hover:border-accent-9 hover:bg-surface-2"
        role="button"
        aria-label="Drop files or click to browse"
      >
        <Upload className="size-8 text-surface-fg-muted" aria-hidden />
        <p className="text-body-sm text-surface-fg-muted">
          Drop any files here, or <span className="font-medium text-accent-11">click to browse</span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
          tabIndex={-1}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-body-xs text-surface-fg-muted">
            {files.length} file{files.length !== 1 ? "s" : ""} · Total: {formatBytes(totalSize)}
          </p>
          <ul className="max-h-64 overflow-y-auto rounded-lg border border-surface-border divide-y divide-surface-border">
            {files.map((file, idx) => (
              <li key={`${file.name}-${idx}`} className="flex items-center gap-3 px-4 py-2.5">
                <File className="size-4 shrink-0 text-surface-fg-muted" aria-hidden />
                <span className="flex-1 truncate text-body-sm">{file.name}</span>
                <span className="shrink-0 text-body-xs text-surface-fg-muted">{formatBytes(file.size)}</span>
                <button
                  onClick={() => removeFile(idx)}
                  className="shrink-0 rounded p-1 text-surface-fg-muted hover:text-destructive-9 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-9"
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="zip-folder" className="block text-body-sm font-medium">
            Folder inside ZIP <span className="font-normal text-surface-fg-muted">(optional)</span>
          </label>
          <input
            id="zip-folder"
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="e.g. documents"
            className="w-full rounded-lg border border-surface-border bg-surface-1 px-3 py-2 text-body-sm placeholder:text-surface-fg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-9"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="zip-name" className="block text-body-sm font-medium">
            ZIP filename
          </label>
          <div className="flex items-center gap-1">
            <input
              id="zip-name"
              type="text"
              value={zipName}
              onChange={(e) => setZipName(e.target.value)}
              placeholder="archive"
              className="flex-1 rounded-lg border border-surface-border bg-surface-1 px-3 py-2 text-body-sm placeholder:text-surface-fg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-9"
            />
            <span className="shrink-0 text-body-sm text-surface-fg-muted">.zip</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleCreate}
        disabled={busy || files.length === 0}
        className="w-full sm:w-auto"
      >
        {done ? (
          <>
            <Check className="mr-2 size-4" aria-hidden /> ZIP Created
          </>
        ) : (
          <>
            <Archive className="mr-2 size-4" aria-hidden /> {busy ? "Creating…" : "Create ZIP"}
          </>
        )}
      </Button>
    </div>
  );
}

// ── Extract ZIP tab ───────────────────────────────────────────────────────────

function ExtractZipTab() {
  const [entries, setEntries] = useState<ZipEntry[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadZip = useCallback(async (file: File) => {
    setBusy(true);
    setEntries([]);
    fire("process_start", { tool_id: "zip-tool" });
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — jszip installed at build time, types via @types/jszip
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(file);
      const list: ZipEntry[] = [];
      zip.forEach((relativePath: string, zipEntry: { dir: boolean; _data?: { uncompressedSize?: number } }) => {
        list.push({
          name: relativePath,
          size: zipEntry.dir ? 0 : zipEntry._data?.uncompressedSize ?? 0,
          isDir: zipEntry.dir,
        });
      });
      list.sort((a, b) => a.name.localeCompare(b.name));
      setEntries(list);
      setZipFile(file);
    } catch (err) {
      console.error(err);
      toast.error("Could not read ZIP. The file may be corrupt or password-protected.");
    } finally {
      setBusy(false);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast.error("Please drop a .zip file.");
      return;
    }
    loadZip(file);
  };

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadZip(file);
  };

  const extractAll = async () => {
    if (!zipFile) return;
    setExtracting(true);
    fire("process_start", { tool_id: "zip-tool" });
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — jszip installed at build time, types via @types/jszip
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(zipFile);
      const fileEntries: Array<{ name: string; blob: Blob }> = [];
      const promises: Promise<void>[] = [];
      zip.forEach((relativePath: string, zipEntry: { dir: boolean; async: (type: string) => Promise<Blob> }) => {
        if (!zipEntry.dir) {
          promises.push(
            zipEntry.async("blob").then((blob: Blob) => {
              fileEntries.push({ name: relativePath, blob });
            }),
          );
        }
      });
      await Promise.all(promises);
      for (const { name, blob } of fileEntries) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name.split("/").pop() ?? name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        // small gap to avoid browser throttling multiple downloads
        await new Promise((r) => setTimeout(r, 120));
      }
      fire("download_click", { tool_id: "zip-tool", output_type: "application/zip" });
      toast.success(`${fileEntries.length} file${fileEntries.length !== 1 ? "s" : ""} extracted.`);
    } catch (err) {
      console.error(err);
      toast.error("Extraction failed. Check browser console.");
    } finally {
      setExtracting(false);
    }
  };

  const extractSingle = async (entryName: string) => {
    if (!zipFile) return;
    fire("process_start", { tool_id: "zip-tool" });
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — jszip installed at build time, types via @types/jszip
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(zipFile);
      const entry = zip.file(entryName);
      if (!entry) return;
      const blob = await entry.async("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = entryName.split("/").pop() ?? entryName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      fire("download_click", { tool_id: "zip-tool", output_type: "application/zip" });
    } catch (err) {
      console.error(err);
      toast.error("Could not extract file.");
    }
  };

  const fileEntries = entries.filter((e) => !e.isDir);
  const hasEntries = entries.length > 0;

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-surface-border p-10 text-center transition hover:border-accent-9 hover:bg-surface-2"
        role="button"
        aria-label="Drop a ZIP file or click to browse"
      >
        <Archive className="size-8 text-surface-fg-muted" aria-hidden />
        <p className="text-body-sm text-surface-fg-muted">
          Drop a <span className="font-medium">.zip</span> file here, or{" "}
          <span className="font-medium text-accent-11">click to browse</span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,application/zip"
          className="sr-only"
          onChange={handleBrowse}
          tabIndex={-1}
        />
      </div>

      {busy && (
        <p className="text-body-sm text-surface-fg-muted animate-pulse">Reading ZIP…</p>
      )}

      {/* File tree */}
      {hasEntries && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-body-xs text-surface-fg-muted">
              {fileEntries.length} file{fileEntries.length !== 1 ? "s" : ""} in{" "}
              <span className="font-medium">{zipFile?.name}</span>
            </p>
            <Button
              size="sm"
              onClick={extractAll}
              disabled={extracting || fileEntries.length === 0}
            >
              <Download className="mr-2 size-4" aria-hidden />
              {extracting ? "Extracting…" : "Extract All"}
            </Button>
          </div>

          <ul className="max-h-80 overflow-y-auto rounded-lg border border-surface-border divide-y divide-surface-border">
            {entries.map((entry) => (
              <li
                key={entry.name}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                {entry.isDir ? (
                  <Folder className="size-4 shrink-0 text-accent-9" aria-hidden />
                ) : (
                  <File className="size-4 shrink-0 text-surface-fg-muted" aria-hidden />
                )}
                <span className="flex-1 truncate text-body-sm font-mono text-xs">{entry.name}</span>
                {!entry.isDir && entry.size > 0 && (
                  <span className="shrink-0 text-body-xs text-surface-fg-muted">
                    {formatBytes(entry.size)}
                  </span>
                )}
                {!entry.isDir && (
                  <button
                    onClick={() => extractSingle(entry.name)}
                    className="shrink-0 rounded p-1 text-surface-fg-muted hover:text-accent-11 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-9"
                    aria-label={`Download ${entry.name}`}
                  >
                    <Download className="size-4" aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Tab = "create" | "extract";

export function ZipToolForm() {
  const [tab, setTab] = useState<Tab>("create");

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-surface-2 p-1 w-fit">
        {(["create", "extract"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "rounded-md px-4 py-1.5 text-body-sm font-medium transition",
              tab === t
                ? "bg-surface-1 text-surface-fg shadow-sm"
                : "text-surface-fg-muted hover:text-surface-fg",
            ].join(" ")}
            aria-pressed={tab === t}
          >
            {t === "create" ? "Create ZIP" : "Extract ZIP"}
          </button>
        ))}
      </div>

      {tab === "create" ? <CreateZipTab /> : <ExtractZipTab />}
    </div>
  );
}
