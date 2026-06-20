"use client";

import { useEffect } from "react";
import { fire } from "@/lib/analytics";
import { captureAttribution, resolveSegment, startSignalCollection } from "@/lib/segment";

const SEGMENT_FIRED_KEY = "bt-segment-fired"; // sessionStorage: once-per-session guard

// Mounts the segmentation side-effects:
//  1. Captures UTM + referrer to localStorage once on first visit
//  2. Subscribes the signal collector to the analytics event bus
//  3. Fires `segment_resolved` once per session (covers aspirant too, which
//     the paywall pitch short-circuits before it can log)
//
// Renders nothing. Place once in the root layout — it MUST run on every page
// because attribution capture depends on the entry URL, and the signal
// subscription is global.
export function SegmentBootstrap() {
  useEffect(() => {
    captureAttribution();
    const stop = startSignalCollection();

    let alreadyFired = false;
    try {
      alreadyFired = sessionStorage.getItem(SEGMENT_FIRED_KEY) === "1";
    } catch {
      // sessionStorage blocked — fire anyway (at worst once per page load).
    }
    if (!alreadyFired) {
      const { primary, confidence, signals_used } = resolveSegment();
      fire("segment_resolved", { segment: primary, confidence, signals_used });
      try {
        sessionStorage.setItem(SEGMENT_FIRED_KEY, "1");
      } catch {
        // ignore
      }
    }

    return () => stop();
  }, []);

  return null;
}
