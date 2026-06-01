// IndexedDB mirror for the pipeline store.
//
// The module-scope singleton is the primary transport — it survives soft
// (`<Link>`) navigation because the JS module isn't re-evaluated. The IDB
// mirror is INSURANCE: it lets the entry survive a hard refresh too.
//
// We store the Blob directly. IDB supports Blob values natively in every
// modern browser; no base64 round-trip needed.

import {
  PIPELINE_CURRENT_KEY,
  PIPELINE_DB,
  PIPELINE_STORE,
  type PipelineEntry,
} from "./types";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(PIPELINE_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PIPELINE_STORE)) {
        db.createObjectStore(PIPELINE_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IDB open failed"));
  });
}

export async function idbWrite(entry: PipelineEntry): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PIPELINE_STORE, "readwrite");
      tx.objectStore(PIPELINE_STORE).put(entry, PIPELINE_CURRENT_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IDB write failed"));
    });
    db.close();
  } catch {
    // IDB blocked (private mode, quota) — singleton still works for soft nav.
  }
}

export async function idbRead(): Promise<PipelineEntry | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await openDb();
    const value = await new Promise<PipelineEntry | null>((resolve, reject) => {
      const tx = db.transaction(PIPELINE_STORE, "readonly");
      const req = tx.objectStore(PIPELINE_STORE).get(PIPELINE_CURRENT_KEY);
      req.onsuccess = () => resolve((req.result as PipelineEntry) ?? null);
      req.onerror = () => reject(req.error ?? new Error("IDB read failed"));
    });
    db.close();
    return value;
  } catch {
    return null;
  }
}

export async function idbClear(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PIPELINE_STORE, "readwrite");
      tx.objectStore(PIPELINE_STORE).delete(PIPELINE_CURRENT_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IDB clear failed"));
    });
    db.close();
  } catch {
    // ignore
  }
}
