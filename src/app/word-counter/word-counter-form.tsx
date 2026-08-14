"use client";

import { useState, useRef, useCallback } from "react";
import { fire } from "@/lib/analytics/events";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "is", "was", "are", "were", "be", "been", "it",
  "its", "this", "that", "these", "those", "i", "you", "he", "she",
  "we", "they", "my", "your", "his", "her", "our", "their", "as", "if",
  "not", "no", "so", "do", "did", "does", "have", "has", "had", "from",
  "up", "about", "into", "through", "during", "before", "after",
]);

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const matches = w.replace(/e$/, "").match(/[aeiouy]+/g);
  return matches ? matches.length : 1;
}

interface Stats {
  chars: number;
  charsNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
  speakingTime: string;
  fleschScore: number | null;
  fleschLabel: string;
  keywords: { word: string; count: number; pct: string }[];
}

function analyze(text: string): Stats {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;

  const wordList = text.trim() === "" ? [] : text.trim().split(/\s+/).filter((w) => w.length > 0);
  const words = wordList.length;

  const sentenceList = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentences = sentenceList.length;

  const paragraphList = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  const paragraphs = paragraphList.length;

  function formatTime(minutes: number): string {
    if (minutes < 1) return "< 1 min";
    const m = Math.floor(minutes);
    const s = Math.round((minutes - m) * 60);
    return s > 0 ? `${m} min ${s} sec` : `${m} min`;
  }

  const readingTime = formatTime(words / 200);
  const speakingTime = formatTime(words / 130);

  let fleschScore: number | null = null;
  let fleschLabel = "";

  if (words > 0 && sentences > 0) {
    const totalSyllables = wordList.reduce((acc, w) => acc + countSyllables(w), 0);
    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (totalSyllables / words);
    fleschScore = Math.round(Math.min(100, Math.max(0, score)));
    if (fleschScore >= 90) fleschLabel = "Very Easy";
    else if (fleschScore >= 80) fleschLabel = "Easy";
    else if (fleschScore >= 70) fleschLabel = "Fairly Easy";
    else if (fleschScore >= 60) fleschLabel = "Standard";
    else if (fleschScore >= 50) fleschLabel = "Fairly Difficult";
    else if (fleschScore >= 30) fleschLabel = "Difficult";
    else fleschLabel = "Very Confusing";
  }

  // Keyword frequency
  const freq: Record<string, number> = {};
  for (const w of wordList) {
    const clean = w.toLowerCase().replace(/[^a-z0-9'-]/g, "");
    if (!clean || STOP_WORDS.has(clean) || clean.length < 2) continue;
    freq[clean] = (freq[clean] ?? 0) + 1;
  }

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const keywords = sorted.map(([word, count]) => ({
    word,
    count,
    pct: words > 0 ? ((count / words) * 100).toFixed(2) + "%" : "0%",
  }));

  return { chars, charsNoSpaces, words, sentences, paragraphs, readingTime, speakingTime, fleschScore, fleschLabel, keywords };
}

function FleschBar({ score }: { score: number }) {
  let color = "bg-success-500";
  if (score < 50) color = "bg-error-500";
  else if (score < 60) color = "bg-warning-500";
  else if (score < 70) color = "bg-warning-400";

  return (
    <div className="w-full rounded-full bg-surface-3 h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

export function WordCounterForm() {
  const [text, setText] = useState("");
  const firedRef = useRef(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    if (val.trim() && !firedRef.current) {
      fire("process_start", { tool_id: "word-counter" });
      firedRef.current = true;
    }
  }, []);

  const stats = analyze(text);
  const hasText = text.trim().length > 0;

  const statCards = [
    { label: "Words", value: stats.words.toLocaleString("en-IN") },
    { label: "Characters", value: stats.chars.toLocaleString("en-IN") },
    { label: "Chars (no spaces)", value: stats.charsNoSpaces.toLocaleString("en-IN") },
    { label: "Sentences", value: stats.sentences.toLocaleString("en-IN") },
    { label: "Paragraphs", value: stats.paragraphs.toLocaleString("en-IN") },
    { label: "Reading time", value: hasText ? stats.readingTime : "—" },
    { label: "Speaking time", value: hasText ? stats.speakingTime : "—" },
  ];

  return (
    <div className="space-y-6">
      {/* Textarea */}
      <div className="rounded-xl border border-surface-border bg-surface-1 p-4">
        <label htmlFor="wc-input" className="block mb-2 text-body-sm font-medium text-surface-fg">
          Your text
        </label>
        <textarea
          id="wc-input"
          value={text}
          onChange={handleChange}
          rows={12}
          className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg placeholder:text-surface-fg-muted focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
          placeholder="Paste or type your text here…"
        />
        <div className="mt-2 flex justify-end gap-4 text-body-xs text-surface-fg-muted">
          <span>{stats.words.toLocaleString("en-IN")} words</span>
          <span>{stats.chars.toLocaleString("en-IN")} characters</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-lg border border-surface-border bg-surface-1 px-4 py-3">
            <p className="text-body-xs text-surface-fg-muted">{card.label}</p>
            <p className="text-heading-sm font-bold text-surface-fg mt-0.5">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Readability */}
      {hasText && stats.fleschScore !== null && (
        <div className="rounded-xl border border-surface-border bg-surface-1 p-6 space-y-3">
          <h2 className="text-heading-sm font-semibold text-surface-fg">Readability</h2>
          <div className="flex items-center justify-between mb-1">
            <span className="text-body-sm text-surface-fg">Flesch Reading Ease</span>
            <span className="text-body-sm font-bold text-surface-fg">
              {stats.fleschScore} / 100 — {stats.fleschLabel}
            </span>
          </div>
          <FleschBar score={stats.fleschScore} />
          <p className="text-body-xs text-surface-fg-muted">
            Higher score = easier to read. 60–70 is standard for general audiences.
          </p>
        </div>
      )}

      {/* Keyword density */}
      {hasText && stats.keywords.length > 0 && (
        <div className="rounded-xl border border-surface-border bg-surface-1 p-6">
          <h2 className="text-heading-sm font-semibold text-surface-fg mb-4">
            Keyword Density — Top {stats.keywords.length}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="py-2 px-3 text-left font-semibold text-surface-fg-muted">#</th>
                  <th className="py-2 px-3 text-left font-semibold text-surface-fg-muted">Word</th>
                  <th className="py-2 px-3 text-right font-semibold text-surface-fg-muted">Count</th>
                  <th className="py-2 px-3 text-right font-semibold text-surface-fg-muted">Density</th>
                </tr>
              </thead>
              <tbody>
                {stats.keywords.map((kw, i) => (
                  <tr key={kw.word} className={`border-b border-surface-border/50 ${i % 2 === 1 ? "bg-surface-2/40" : ""}`}>
                    <td className="py-1.5 px-3 text-surface-fg-muted">{i + 1}</td>
                    <td className="py-1.5 px-3 text-surface-fg font-medium">{kw.word}</td>
                    <td className="py-1.5 px-3 text-right text-surface-fg">{kw.count}</td>
                    <td className="py-1.5 px-3 text-right text-surface-fg-muted">{kw.pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
