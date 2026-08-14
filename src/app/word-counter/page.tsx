import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { WordCounterForm } from "./word-counter-form";

const PAGE_TITLE = "Word Counter — Characters, Sentences, Reading Time & Keyword Density";
const PAGE_DESCRIPTION =
  "Count words, characters, sentences, and paragraphs instantly. Get reading time, speaking time, Flesch readability score, and top keyword density — all in your browser.";
const PAGE_KEYWORDS = [
  "word counter",
  "character counter",
  "reading time calculator",
  "Flesch reading ease",
  "keyword density",
  "sentence counter",
  "paragraph counter",
  "word count online",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/word-counter",
    languages: {
      "en-IN": "/word-counter",
      "hi-IN": "/word-counter",
      "x-default": "/word-counter",
    },
  },
  openGraph: {
    type: "website",
    url: "/word-counter",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default async function WordCounterPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Word Counter",
          description: PAGE_DESCRIPTION,
          path: "/word-counter",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Word Counter" },
          ],
          steps: [
            { name: "Paste or type your text", text: "Enter any text into the large textarea." },
            { name: "View live statistics", text: "Word count, character count, sentences, paragraphs, reading and speaking time all update instantly." },
            { name: "Check readability and keywords", text: "See the Flesch Reading Ease score and the top 10 keywords by frequency." },
          ],
          featureList: [
            "Real-time word and character count",
            "Sentence and paragraph count",
            "Estimated reading and speaking time",
            "Flesch Reading Ease score",
            "Top 10 keyword density table",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "How is reading time calculated?",
              answer:
                "Reading time is estimated at 200 words per minute, which is the average silent reading speed for an adult.",
            },
            {
              question: "What is Flesch Reading Ease?",
              answer:
                "Flesch Reading Ease scores text on a 0–100 scale. Higher scores mean easier to read. 60–70 is standard for general audiences; below 30 is very difficult (academic or legal text).",
            },
            {
              question: "Is my text stored anywhere?",
              answer:
                "No. All processing happens locally in your browser. Your text never leaves your device.",
            },
          ],
        })}
      />
      <PageHeader
        title="Word Counter"
        subtitle="Paste any text — get word count, reading time, readability score, and keyword density instantly."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "Word Counter" }]}
      />
      <div className="mt-8">
        <WordCounterForm />
      </div>
    </main>
  );
}
