"use client";

import { useEffect, useMemo } from "react";

// Creates an object URL for the given Blob and revokes it on unmount or when
// the blob changes. Eliminates the leak class flagged in engineering-decisions
// #7 ("confirm URL.revokeObjectURL called on every preview blob URL — no leaks
// across a 5-step pipeline").
//
// Usage:
//   const url = useBlobUrl(outputBlob);
//   return <img src={url ?? undefined} />;
export function useBlobUrl(blob: Blob | null | undefined): string | null {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => {
    if (!url) return;
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [url]);

  return url;
}
