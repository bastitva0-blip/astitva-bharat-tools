// Worker runner (base-infrastructure-plan §2.1).
//
// A minimal Promise-shaped wrapper around the `Worker` API with cancellation
// + progress streaming + structured-clone-friendly request/response framing.
// Avoids pulling in Comlink (~3 KB gzip plus its own RPC semantics) — at our
// scale a hand-rolled 30-line protocol is cheaper and clearer.
//
// Wire format (over postMessage):
//
//   main → worker:  { type: "run", reqId, payload, transfer? }
//   worker → main:  { type: "progress", reqId, value, phase?, label? }
//                |  { type: "result",   reqId, payload, transfer? }
//                |  { type: "error",    reqId, name, message }
//
// On cancel we `terminate()` the worker — there's no portable way to soft-
// interrupt running code inside a worker, and termination is fast.

import { CancellationError, throwIfAborted } from "./cancel";
import { noopProgress, type ProgressReporter } from "./progress";

export interface WorkerCallOptions {
  signal?: AbortSignal;
  progress?: ProgressReporter;
  /**
   * Transferable objects to move (zero-copy) into the worker. Pass the same
   * objects in `payload` — `transfer` is the list of detached owners.
   */
  transfer?: Transferable[];
  /**
   * Hard ceiling. Throws CancellationError if the worker hasn't replied
   * within this many ms. Defaults to no timeout. Use for tools that should
   * never legitimately run for more than N seconds (e.g. small image ops).
   */
  timeoutMs?: number;
}

type WorkerMessage<TResult> =
  | { type: "progress"; reqId: number; value: number; phase?: string; label?: string }
  | { type: "result"; reqId: number; payload: TResult }
  | { type: "error"; reqId: number; name: string; message: string };

let nextReqId = 1;

/**
 * Run a single request against a freshly-spawned Worker and tear it down on
 * completion. Suitable for one-shot processing calls; for hot paths that
 * call the same worker repeatedly, keep a long-lived worker and wire your
 * own request multiplexer on top of this protocol.
 */
export async function runInWorker<TPayload, TResult>(
  worker: Worker,
  payload: TPayload,
  options: WorkerCallOptions = {},
): Promise<TResult> {
  const progress = options.progress ?? noopProgress;
  throwIfAborted(options.signal);

  const reqId = nextReqId++;
  let onAbort: (() => void) | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const settle = () => {
    if (onAbort && options.signal) options.signal.removeEventListener("abort", onAbort);
    if (timeoutId !== null) clearTimeout(timeoutId);
    worker.terminate();
  };

  return new Promise<TResult>((resolve, reject) => {
    worker.addEventListener(
      "message",
      (event: MessageEvent<WorkerMessage<TResult>>) => {
        const msg = event.data;
        if (msg.reqId !== reqId) return;
        if (msg.type === "progress") {
          progress({ value: msg.value, phase: msg.phase, label: msg.label });
          return;
        }
        if (msg.type === "result") {
          settle();
          resolve(msg.payload);
          return;
        }
        if (msg.type === "error") {
          settle();
          const err = new Error(msg.message);
          err.name = msg.name;
          reject(err);
        }
      },
    );

    worker.addEventListener("error", (event) => {
      settle();
      reject(new Error(event.message || "Worker crashed"));
    });

    if (options.signal) {
      onAbort = () => {
        settle();
        reject(new CancellationError());
      };
      options.signal.addEventListener("abort", onAbort, { once: true });
    }

    if (options.timeoutMs !== undefined) {
      timeoutId = setTimeout(() => {
        settle();
        reject(new CancellationError(`Worker exceeded ${options.timeoutMs} ms`));
      }, options.timeoutMs);
    }

    worker.postMessage(
      { type: "run", reqId, payload },
      options.transfer ?? [],
    );
  });
}

// --- Helpers for the worker side ----------------------------------------
//
// Workers built against this protocol look like:
//
//   /// <reference lib="webworker" />
//   import { handleWorkerRequest } from "@/lib/processing/kernel/runInWorker";
//   handleWorkerRequest<MyPayload, MyResult>(async (payload, ctx) => {
//     ctx.progress(0.1, "decode");
//     ...
//     return result;
//   });

interface WorkerCtx {
  progress: (value: number, phase?: string, label?: string) => void;
}

// Minimal structural type for a DedicatedWorkerGlobalScope's `self`. We
// don't pull in the `webworker` TS lib because that would conflict with the
// `dom` lib used by the rest of the codebase. Worker files using this
// helper run in a webworker context at runtime; the types here only need
// the two methods we touch.
interface WorkerScope {
  addEventListener: (type: "message", listener: (event: MessageEvent) => void) => void;
  postMessage: (data: unknown, transfer?: Transferable[]) => void;
}

/**
 * Wires up a worker to respond to one `{type: "run"}` request at a time.
 * Call from inside a `*.worker.ts` module.
 */
export function handleWorkerRequest<TPayload, TResult>(
  handler: (payload: TPayload, ctx: WorkerCtx) => Promise<TResult> | TResult,
  options: { transfer?: (result: TResult) => Transferable[] } = {},
): void {
  const scope = self as unknown as WorkerScope;
  scope.addEventListener("message", async (event: MessageEvent) => {
    const data = event.data as { type: "run"; reqId: number; payload: TPayload };
    if (data?.type !== "run") return;
    const { reqId, payload } = data;
    const ctx: WorkerCtx = {
      progress: (value, phase, label) => {
        scope.postMessage({ type: "progress", reqId, value, phase, label });
      },
    };
    try {
      const result = await handler(payload, ctx);
      const transfer = options.transfer?.(result) ?? [];
      scope.postMessage({ type: "result", reqId, payload: result }, transfer);
    } catch (err) {
      scope.postMessage({
        type: "error",
        reqId,
        name: err instanceof Error ? err.name : "Error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });
}
