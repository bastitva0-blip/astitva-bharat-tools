// Shared types for the "Continue Editing" pipeline (base-infrastructure-plan
// §4, engineering-decisions #2).

export interface PipelineMeta {
  name: string;
  type: string;
  dims?: { w: number; h: number };
}

export interface PipelineEntry {
  blob: Blob;
  meta: PipelineMeta;
  fromTool: string;
  createdAt: number; // epoch ms
}

// Idle window before the entry is considered stale and cleared on next read.
export const PIPELINE_IDLE_MS = 30 * 60 * 1000;

// IndexedDB names.
export const PIPELINE_DB = "bt-pipeline";
export const PIPELINE_STORE = "entries";
export const PIPELINE_CURRENT_KEY = "current";
