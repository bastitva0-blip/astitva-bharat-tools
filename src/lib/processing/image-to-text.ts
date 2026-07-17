// Image → text (OCR) via tesseract.js, entirely on-device.
//
// Why a separate module: tesseract.js spins up a Web Worker and pulls its WASM
// core (~2 MB) plus per-language traineddata (a few MB each) on first run. We
// keep it behind a dynamic import so no tool that doesn't do OCR pays for it,
// and so the library never enters the server bundle. The core and traineddata
// are cached (browser cache + IndexedDB) after the first run — user images are
// never uploaded; only the model assets are fetched.

export type OcrLanguage = "eng" | "hin" | "hin+eng";

export interface OcrProgress {
  /** Coarse stage label suitable for showing to the user. */
  stage: "preparing" | "recognizing";
  /** 0..100. Best-effort; setup stages report indeterminate progress as 0. */
  percent: number;
}

export interface OcrResult {
  text: string;
  /** Mean recognition confidence, 0..100. */
  confidence: number;
}

export interface OcrOptions {
  language: OcrLanguage;
  onProgress?: (progress: OcrProgress) => void;
}

export async function imageToText(
  source: Blob,
  { language, onProgress }: OcrOptions,
): Promise<OcrResult> {
  let createWorker: typeof import("tesseract.js").createWorker;
  try {
    ({ createWorker } = await import("tesseract.js"));
  } catch {
    throw new Error(
      "Couldn't load the text recognizer. Check your internet connection and try again.",
    );
  }

  const worker = await createWorker(language, undefined, {
    logger: (m) => {
      if (!onProgress) return;
      if (m.status === "recognizing text") {
        onProgress({ stage: "recognizing", percent: Math.round(m.progress * 100) });
      } else {
        onProgress({ stage: "preparing", percent: 0 });
      }
    },
  });

  try {
    const { data } = await worker.recognize(source);
    return { text: data.text.trim(), confidence: Math.round(data.confidence) };
  } catch {
    throw new Error(
      "Couldn't read text from this image. Try a sharper, higher-contrast photo of the text.",
    );
  } finally {
    await worker.terminate();
  }
}
