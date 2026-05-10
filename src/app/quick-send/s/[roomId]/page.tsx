import type { Metadata } from "next";
import { QuickSendSender } from "./quick-send-sender";

export const metadata: Metadata = {
  title: "Send to print shop · Quick Send",
  description: "Pick files to send to the print shop you're paired with.",
  robots: { index: false, follow: false },
};

export default async function QuickSendSenderPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return (
    <main className="mx-auto w-full max-w-xl px-page-x py-10">
      <h1 className="text-heading-lg font-bold">Send to print shop</h1>
      <p className="mt-2 text-body-md text-surface-fg-muted">
        Pick files to send. They go straight to the shop&apos;s browser - no upload, no copy on a server.
      </p>
      <p className="mt-1 text-body-xs text-surface-fg-muted">Room {roomId}</p>
      <div className="mt-6">
        <QuickSendSender roomId={roomId} />
      </div>
    </main>
  );
}
