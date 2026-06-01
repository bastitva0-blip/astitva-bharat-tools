import type { Metadata } from "next";
import { PipelineBootstrap } from "@/components/pipeline-bootstrap";

// Prototype scaffold per engineering-decisions #2. NOT user-facing — kept
// out of search indexes and the sitemap. Delete when the pipeline UI ships
// and we've recorded the prototype outcome.

export const metadata: Metadata = {
  title: "Pipeline prototype",
  robots: { index: false, follow: false },
};

export default function PipelineTestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PipelineBootstrap />
      <main className="mx-auto w-full max-w-3xl px-page-x py-10 space-y-6">{children}</main>
    </>
  );
}
