"use client";

import { useEffect } from "react";
import { captureAttribution, startSignalCollection } from "@/lib/segment";

// Mounts the segmentation side-effects:
//  1. Captures UTM + referrer to localStorage once on first visit
//  2. Subscribes the signal collector to the analytics event bus
//
// Renders nothing. Place once in the root layout — it MUST run on every page
// because attribution capture depends on the entry URL, and the signal
// subscription is global.
export function SegmentBootstrap() {
  useEffect(() => {
    captureAttribution();
    const stop = startSignalCollection();
    return () => stop();
  }, []);

  return null;
}
