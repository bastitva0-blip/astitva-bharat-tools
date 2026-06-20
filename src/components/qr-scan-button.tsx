"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QrScanner from "qr-scanner";
import { ScanLine, X } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@devalok/shilp-sutra/ui/dialog";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics";

interface Props {
  /** Optional path prefix that, when matched in a scanned URL, triggers same-origin routing. */
  routePrefix?: string;
  label?: string;
  variant?: "soft" | "solid" | "ghost";
}

export function QrScanButton({
  routePrefix = "/quick-send/s/",
  label = "Scan a QR",
  variant = "soft",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <ScanLine size={16} /> {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan a QR code</DialogTitle>
            <DialogDescription>
              Point the camera at the QR. The page will open automatically.
            </DialogDescription>
          </DialogHeader>
          {open && (
            <ScannerView
              routePrefix={routePrefix}
              onClose={() => setOpen(false)}
            />
          )}
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                <X size={14} /> Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ScannerView({
  routePrefix,
  onClose,
}: {
  routePrefix: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let scanner: QrScanner | null = null;
    let cancelled = false;

    const handleDecoded = (data: string) => {
      handledRef.current = true;
      let url: URL | null = null;
      try {
        url = new URL(data, window.location.origin);
      } catch {
        // not a URL
      }

      if (
        url &&
        url.origin === window.location.origin &&
        url.pathname.startsWith(routePrefix)
      ) {
        onClose();
        router.push(url.pathname + url.search);
        return;
      }

      if (url) {
        toast.success(`Scanned: ${url.toString()}`);
        onClose();
        window.open(url.toString(), "_blank", "noopener");
        return;
      }

      toast.success(`Scanned: ${data}`);
      onClose();
    };

    (async () => {
      try {
        const hasCam = await QrScanner.hasCamera();
        if (!hasCam) {
          fire("qs_camera_permission", { state: "no_camera" });
          setError("No camera available on this device.");
          return;
        }
        scanner = new QrScanner(
          video,
          (result) => {
            if (handledRef.current) return;
            handleDecoded(result.data);
          },
          {
            preferredCamera: "environment",
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
            returnDetailedScanResult: true,
          },
        );
        await scanner.start();
        fire("qs_camera_permission", { state: "granted" });
        if (cancelled) scanner.destroy();
      } catch (e) {
        fire("qs_camera_permission", {
          state: e instanceof Error && e.name === "NotAllowedError" ? "denied" : "error",
        });
        setError(
          e instanceof Error
            ? e.message
            : "Could not start the camera. Check browser permissions.",
        );
      }
    })();

    return () => {
      cancelled = true;
      scanner?.destroy();
    };
  }, [routePrefix, onClose, router]);

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-md border border-surface-border-subtle bg-black">
        <video
          ref={videoRef}
          className="block aspect-square w-full object-cover"
          playsInline
          muted
        />
      </div>
      {error && <p className="text-body-sm text-error-11">{error}</p>}
    </div>
  );
}
