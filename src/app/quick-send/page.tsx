import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { QuickSendReceiver } from "./quick-send-receiver";

export const metadata = {
  title: "Quick Send - Send files to a print shop",
  description:
    "Browser-to-browser file transfer for xerox shops. Show a QR, customer scans, files arrive instantly. No app, no number sharing, no cloud upload.",
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
            "Peer-to-peer file transfer for print shops. The shop opens Quick Send and gets a QR code; the customer scans with their phone and sends files directly into the shop's browser via WebRTC. No upload, no app, no phone-number exchange.",
          path: "/quick-send",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Quick Send" }],
          steps: [
            { name: "Open Quick Send", text: "Print-shop operator opens this page on a desktop or laptop browser." },
            { name: "Customer scans QR", text: "The customer scans the on-screen QR code with their phone camera." },
            { name: "Pick files on phone", text: "Customer chooses files from their phone - anything up to 500 MB each." },
            { name: "Print or download", text: "Files arrive in the operator's browser. Click Print for PDFs and images, or Download to save." },
          ],
        })}
      />
      <PageHeader
        title={dict.quickSend.title}
        subtitle={dict.quickSend.subtitle}
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: dict.quickSend.breadcrumb }]}
      />
      <div className="mt-8">
        <QuickSendReceiver />
      </div>
    </main>
  );
}
