import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { VideoCompressForm } from "../video-compress-form";

export const metadata = {
  title: "Compress Video to Custom MB",
  description: "Enter any MB target and compress your video to it. Runs in your browser.",
  alternates: { canonical: "/video-compress/custom" },
};

export default async function VideoCompressCustomPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Compress Video to Custom MB",
          description:
            "Enter any MB target and compress your video to it. Bitrate-search MP4 encode via WebCodecs. Runs in your browser.",
          path: "/video-compress/custom",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Video Compressor", href: "/video-compress" },
            { label: "Custom MB" },
          ],
          steps: [
            { name: "Upload a video", text: "MP4, WebM, MOV or MKV." },
            { name: "Set the target", text: "Enter any MB value with the number input." },
            { name: "Compress", text: "We search encode bitrate to land at or under your target." },
            { name: "Download", text: "Save the MP4 ready to send." },
          ],
        })}
      />
      <PageHeader
        title={dict.videoCompress.custom.title}
        subtitle={dict.videoCompress.custom.subtitle}
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: dict.videoCompress.breadcrumb, href: "/video-compress" },
          { label: dict.videoCompress.custom.breadcrumb },
        ]}
      />
      <div className="mt-8">
        <VideoCompressForm slug="custom" />
      </div>
    </main>
  );
}
