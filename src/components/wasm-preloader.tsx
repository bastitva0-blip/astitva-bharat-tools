"use client";

import { useEffect } from "react";

// Warm up heavy WASM/worker deps while the browser is idle so tool pages
// feel instant. Only fires once per session; errors are swallowed silently.
export function WasmPreloader() {
  useEffect(() => {
    const preload = () => {
      import("tesseract.js").catch(() => {});
      import("pdfjs-dist").catch(() => {});
    };

    if ("requestIdleCallback" in window) {
      const id = (window as typeof window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback(preload, { timeout: 6000 });
      return () => {
        (window as typeof window & { cancelIdleCallback: (id: number) => void })
          .cancelIdleCallback(id);
      };
    } else {
      const t = setTimeout(preload, 4000);
      return () => clearTimeout(t);
    }
  }, []);

  return null;
}
