"use client";

import { useToolAnalytics } from "@/lib/analytics";
import { PairCard } from "./_session/pair-card";
import { SessionPanel } from "./_session/session-panel";
import { useQuickSendSession } from "./_session/use-quick-send-session";

// Host shell. Creates a Quick Send room, shows the pair card while waiting,
// then drops into the same bidirectional session panel that the guest sees
// once the data channel is open.
export function QuickSendHost() {
  useToolAnalytics("quick-send");
  const session = useQuickSendSession({ mode: "host" });
  const showPairing = session.phase === "connecting" || session.phase === "waiting";

  return (
    <div className="space-y-6">
      {showPairing && <PairCard roomId={session.roomId} />}

      {!showPairing && (
        <SessionPanel
          phase={session.phase}
          incoming={session.incoming}
          outgoing={session.outgoing}
          errorMsg={session.errorMsg}
          onSendFiles={session.sendFiles}
          onReset={session.reset}
        />
      )}
    </div>
  );
}
