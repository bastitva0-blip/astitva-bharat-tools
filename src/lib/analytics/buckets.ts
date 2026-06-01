// Pre-bucketed values for analytics payloads.
//
// Raw file sizes and durations leak more signal than needed (and in some
// contexts can de-anonymise). Bucketing at the source means downstream
// systems literally never see precise values.

export type SizeBucket = "<100KB" | "100KB-1MB" | "1-10MB" | "10-50MB" | ">50MB";

export function sizeBucket(bytes: number): SizeBucket {
  const kb = bytes / 1024;
  if (kb < 100) return "<100KB";
  if (kb < 1024) return "100KB-1MB";
  const mb = kb / 1024;
  if (mb < 10) return "1-10MB";
  if (mb < 50) return "10-50MB";
  return ">50MB";
}

export type DurationBucket = "<1s" | "1-5s" | "5-15s" | "15-60s" | ">60s";

export function durationBucket(ms: number): DurationBucket {
  if (ms < 1000) return "<1s";
  if (ms < 5000) return "1-5s";
  if (ms < 15000) return "5-15s";
  if (ms < 60000) return "15-60s";
  return ">60s";
}

export type DeviceClass = "mobile" | "tablet" | "desktop";

export function deviceClass(): DeviceClass {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/Mobi|Android.+Mobile|iPhone/.test(ua)) return "mobile";
  if (/Tablet|iPad|Android(?!.*Mobile)/.test(ua)) return "tablet";
  return "desktop";
}
