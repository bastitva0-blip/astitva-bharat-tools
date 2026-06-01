// "0 bytes sent" architectural assertion (base-infrastructure-plan §2.4).
//
// The trust badge on every tool page claims processing happens locally — no
// upload, no server call. This helper makes that claim ARCHITECTURALLY true by
// monkey-patching `fetch` and `XMLHttpRequest` for the duration of a processing
// call. Any network call originating from processing code throws in dev and
// logs in prod.
//
// Usage (wrap the processing function, not the whole page — analytics/Umami
// calls outside the wrapped block remain fine):
//
//   await runWithZeroBytesAssert("photo-resize", async () => {
//     return resizeToSpec(file, preset);
//   });
//
// Pair with a CI grep that rejects `fetch(` or `new XMLHttpRequest` inside
// src/lib/processing/.

const isProd = process.env.NODE_ENV === "production";

export class ZeroBytesViolation extends Error {
  constructor(toolId: string, target: string) {
    super(
      `[zero-bytes] tool "${toolId}" attempted a network call to "${target}". ` +
        `Processing must stay on-device — see base-infrastructure-plan §2.4.`,
    );
    this.name = "ZeroBytesViolation";
  }
}

type FetchFn = typeof fetch;

interface XHRCtor {
  new (): XMLHttpRequest;
  prototype: XMLHttpRequest;
}

export async function runWithZeroBytesAssert<T>(
  toolId: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (typeof window === "undefined") {
    // SSR / server: no global fetch interception needed; processing is
    // browser-only by architecture, so this is a no-op on the server.
    return fn();
  }

  const originalFetch: FetchFn = window.fetch.bind(window);
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const w = window as Window & { XMLHttpRequest: XHRCtor };

  const violations: string[] = [];

  const handleViolation = (target: string) => {
    violations.push(target);
    if (!isProd) {
      throw new ZeroBytesViolation(toolId, target);
    } else {
      console.warn(`[zero-bytes] tool "${toolId}" hit "${target}" — investigate.`);
    }
  };

  w.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const target = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    handleViolation(target);
    return originalFetch(input, init);
  }) as FetchFn;

  XMLHttpRequest.prototype.open = function (
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    ...rest: unknown[]
  ) {
    handleViolation(typeof url === "string" ? url : url.href);
    // @ts-expect-error — forwarding the variadic rest to the native open.
    return originalXHROpen.call(this, method, url, ...rest);
  };

  try {
    return await fn();
  } finally {
    w.fetch = originalFetch;
    XMLHttpRequest.prototype.open = originalXHROpen;
    if (isProd && violations.length) {
      console.warn(`[zero-bytes] "${toolId}" finished with ${violations.length} violation(s).`);
    }
  }
}
