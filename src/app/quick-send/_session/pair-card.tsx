"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { QrScanButton } from "@/components/qr-scan-button";
import { SITE_URL } from "@/lib/seo/site";

interface PairCardProps {
  /** Room ID returned by the signaling server, or null while loading. */
  roomId: string | null;
}

// Host-only pre-pairing card. Shows three ways to onboard the other device:
//   1. Scan the QR (phone → laptop).
//   2. Type the short code into the other browser's address bar.
//   3. Open the full URL on the other device (e.g. paste into a chat).
//
// "Scan a QR instead" flips the polarity for the laptop-as-sender case:
// instead of waiting for someone to scan THIS screen, the host scans the
// other device's QR. This is the answer to "I can't scan my laptop with
// my phone — there's no way to do it the other way around."
export function PairCard({ roomId }: PairCardProps) {
  const [copied, setCopied] = useState<"code" | "url" | null>(null);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
    },
    [],
  );

  const senderUrl = roomId ? `${SITE_URL}/quick-send/s/${roomId}` : "";
  const displayCode = formatRoomCode(roomId);

  const copy = async (kind: "code" | "url", value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
      copyResetRef.current = setTimeout(() => setCopied(null), 1800);
    } catch {
      toast.error("Could not copy. Long-press to copy manually.");
    }
  };

  return (
    <Card variant="outline">
      <CardHeader>
        <CardTitle>Pair another device</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!roomId ? (
          <p className="text-body-md text-surface-fg-muted">Connecting…</p>
        ) : (
          <>
            <div className="space-y-3">
              <p className="text-body-sm text-surface-fg-muted">
                On the other device, type this short code into the address bar
                after <code className="rounded bg-surface-2 px-1 py-0.5">bharattools.app/s/</code>
              </p>
              <button
                type="button"
                onClick={() => roomId && copy("code", roomId)}
                aria-label={copied === "code" ? "Code copied" : "Copy room code"}
                className="group flex w-full items-center justify-between gap-3 rounded-md border border-surface-border-subtle bg-surface-2 px-4 py-3 text-left transition-colors hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8"
              >
                <span className="font-mono text-heading-md text-surface-fg sm:text-heading-lg">
                  {displayCode}
                </span>
                {copied === "code" ? (
                  <Check className="size-5 shrink-0 text-success-11" />
                ) : (
                  <Copy className="size-5 shrink-0 text-surface-fg-muted transition-colors group-hover:text-surface-fg" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 text-body-xs text-surface-fg-muted">
              <span className="h-px flex-1 bg-surface-border-subtle" />
              <span>or</span>
              <span className="h-px flex-1 bg-surface-border-subtle" />
            </div>

            <div className="space-y-3">
              <p className="text-body-sm text-surface-fg-muted">
                Scan this QR with the other device&apos;s camera.
              </p>
              <div className="flex justify-center rounded-md border border-surface-border-subtle bg-white p-6">
                <QRCodeCanvas
                  value={senderUrl}
                  size={224}
                  level="M"
                  includeMargin={false}
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
              <div className="flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => copy("url", senderUrl)}
                  aria-label={copied === "url" ? "Link copied" : "Copy link"}
                  className="flex flex-1 items-center gap-2 break-all rounded bg-surface-2 px-2 py-1 text-left text-body-xs hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8"
                >
                  {copied === "url" ? (
                    <Check className="size-3.5 shrink-0 text-success-11" />
                  ) : (
                    <Copy className="size-3.5 shrink-0 text-surface-fg-muted" />
                  )}
                  <code className="min-w-0 flex-1 break-all">{senderUrl}</code>
                </button>
                <Button
                  type="button"
                  variant="soft"
                  size="sm"
                  asChild
                  aria-label="Open link in new tab"
                  className="shrink-0"
                >
                  <a href={senderUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                    <span className="ml-1">Open</span>
                  </a>
                </Button>
              </div>
            </div>

            <div className="border-t border-surface-border-subtle pt-4">
              <p className="mb-2 text-body-xs text-surface-fg-muted">
                Got the file on this device? Scan a code shown on the other
                device instead — works great when the file is on your laptop.
              </p>
              <QrScanButton label="Scan a code from another device" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Render the room code for display. Codes are `river-flower`
 * (e.g. `ganga-kamal`) — shown as-is so it matches what the user
 * types into the address bar. Falls back to "—" while loading.
 */
function formatRoomCode(roomId: string | null): string {
  if (!roomId) return "—";
  return roomId;
}
