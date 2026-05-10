import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { Footer } from "@/components/footer";
import { ToolsBrowser } from "@/components/tools-browser";

export default function HomePage() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-page-x py-20">
        <header className="mb-16 text-center">
          <Badge color="accent" className="mb-5">
            Browser-only · Files never uploaded
          </Badge>
          <h1 className="mb-5 text-5xl font-bold tracking-tight">
            Har Sarkari form ka{" "}
            <span className="bg-linear-to-r from-accent-11 to-accent-9 bg-clip-text text-transparent">
              saathi
            </span>
            .
          </h1>
          <p className="mx-auto max-w-2xl text-body-lg font-medium text-surface-fg">
            Photo to spec, signature merge, KB compression, print sheet - every step of submitting
            an Indian government form, in one place.{" "}
            <span className="text-surface-fg-muted">
              All on-device. Your files never leave your browser.
            </span>
          </p>
        </header>

        <ToolsBrowser />
      </main>
      <Footer />
    </>
  );
}
