import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { QuickSendHost } from "./quick-send-host";

export const metadata = {
  title: "Quick Send — share files between your devices",
  description:
    "Browser-to-browser file transfer. Pair two devices with a short code or QR — then drag and drop files in either direction. No upload, no app, no cloud copy.",
  alternates: { canonical: "/quick-send" },
};

export default async function QuickSendPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Quick Send",
          description:
            "Peer-to-peer file transfer between two browsers. Pair via QR or short code, then drag-and-drop files in either direction over WebRTC. No upload, no app, no phone-number exchange.",
          path: "/quick-send",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Quick Send" }],
          steps: [
            {
              name: "Open Quick Send",
              text: "Open this page on the device you want to pair with — laptop, phone or tablet.",
            },
            {
              name: "Pair the other device",
              text: "Show its QR code (or type the short code) on the second device. Or tap 'Scan a code' to pair the other way around.",
            },
            {
              name: "Drag-and-drop in either direction",
              text: "Once paired, either device can drop files. They go straight to the other browser — nothing is uploaded.",
            },
            {
              name: "Print or download",
              text: "Click Print for PDFs and images, or Download to save anything.",
            },
          ],
        })}
      />
      <PageHeader
        title={dict.quickSend.title}
        subtitle={dict.quickSend.subtitle}
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: dict.quickSend.breadcrumb }]}
      />
      <div className="mt-8">
        <QuickSendHost />
      </div>
    </main>
  );
}
