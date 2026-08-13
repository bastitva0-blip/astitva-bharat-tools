"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@devalok/shilp-sutra/ui/toaster";
import type { ReactNode } from "react";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { SwRegister } from "@/components/sw-register";
import { WasmPreloader } from "@/components/wasm-preloader";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <Toaster />
      <PwaInstallBanner />
      <WasmPreloader />
      <SwRegister />
    </ThemeProvider>
  );
}
