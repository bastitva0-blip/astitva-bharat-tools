"use client";

import { useToolAnalytics } from "@/lib/analytics";
import { SessionPanel } from "../../_session/session-panel";
import { useQuickSendSession } from "../../_session/use-quick-send-session";

// Guest shell. Joins the room by URL — no pair card needed, the URL itself
// is the pairing token. After the data channel opens, the UI is identical
// to the host's: drag-and-drop in either direction.
export function QuickSendGuest({ roomId }: { roomId: string }) {
  useToolAnalytics("quick-send");
  const session = useQuickSendSession({ mode: "guest", roomId });
  return (
    <SessionPanel
      phase={session.phase}
      incoming={session.incoming}
      outgoing={session.outgoing}
      errorMsg={session.errorMsg}
      onSendFiles={session.sendFiles}
      onReset={session.reset}
    />
  );
}
