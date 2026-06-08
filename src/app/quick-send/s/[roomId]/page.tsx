import type { Metadata } from "next";
import { QuickSendGuest } from "./quick-send-guest";

export const metadata: Metadata = {
  title: "Paired · Quick Send",
  description: "You're paired with another device. Drop files to send in either direction.",
  robots: { index: false, follow: false },
};

export default async function QuickSendGuestPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <h1 className="text-heading-lg font-bold">Quick Send</h1>
      <p className="mt-2 text-body-md text-surface-fg-muted">
        You&apos;re paired with another device. Drop files to send — or receive whatever the other side drops. Nothing is uploaded.
      </p>
      <p className="mt-1 text-body-xs text-surface-fg-muted">
        Session <code className="rounded bg-surface-2 px-1 py-0.5">{roomId}</code>
      </p>
      <div className="mt-6">
        <QuickSendGuest roomId={roomId} />
      </div>
    </main>
  );
}
