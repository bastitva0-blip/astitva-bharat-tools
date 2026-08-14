"use client";

import { useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/for-operators`
        : "https://bharattools.in/for-operators";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button variant="outline" size="lg" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy link"}
    </Button>
  );
}
