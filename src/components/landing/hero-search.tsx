"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { SearchInput } from "@devalok/shilp-sutra/ui/search-input";
import { ToolIcon } from "@/components/tool-icon";
import { useT } from "@/i18n/provider";
import { fire } from "@/lib/analytics/events";
import { resolveDeepLink } from "@/lib/search/deepLink";
import { searchTools } from "@/lib/search";
import { getToolText } from "@/lib/tool-text";
import { getRecentSlugs, recordRecentSlug } from "@/lib/recent-tools";
import { tools, type Tool } from "@/lib/tools";

function isInputTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
}

const toolBySlug = new Map<string, Tool>(tools.map((t) => [t.slug, t]));

export function HeroSearch({
  placeholder,
  searchAria,
}: {
  placeholder: string;
  searchAria: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dict = useT();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tool[]>([]);
  const [open, setOpen] = useState(false);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const openedRef = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && !e.metaKey && !e.ctrlKey && !isInputTarget(e.target)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Pre-fill from ?q= (Google sitelinks search box, shared links).
  useEffect(() => {
    const q = searchParams.get("q");
    if (!q) return;
    const trimmed = q.slice(0, 100);
    setQuery(trimmed);
    const outcome = searchTools(trimmed);
    setResults(outcome.results.slice(0, 5));
    setOpen(true);
    inputRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load recent tools from localStorage once on mount.
  useEffect(() => {
    const slugs = getRecentSlugs();
    const recent = slugs.map((s) => toolBySlug.get(s)).filter(Boolean) as Tool[];
    setRecentTools(recent);
  }, []);

  const markOpened = () => {
    if (openedRef.current) return;
    openedRef.current = true;
    fire("search_opened", { surface: "home" });
  };

  const deepLink = useMemo(() => resolveDeepLink(query), [query]);

  const onChange = (value: string) => {
    setQuery(value);
    markOpened();
    startTransition(() => {
      const outcome = searchTools(value);
      setResults(outcome.results.slice(0, 5));
      setOpen(value.length > 0 || recentTools.length > 0);
    });
  };

  const navigate = (href: string, slug: string, rank: number) => {
    fire("search_result_click", { query: query.trim(), result_slug: slug, rank });
    recordRecentSlug(slug);
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (deepLink) {
        fire("search_result_click", { query: query.trim(), result_slug: deepLink.toolSlug, rank: 0 });
        recordRecentSlug(deepLink.toolSlug);
        setOpen(false);
        setQuery("");
        router.push(deepLink.href);
      } else if (results.length > 0) {
        navigate(results[0].href, results[0].slug, 0);
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showRecent = !query && recentTools.length > 0;
  const dropdownVisible = open && (deepLink || results.length > 0 || showRecent);

  return (
    <div className="relative w-full max-w-xl">
      <SearchInput
        ref={inputRef}
        size="lg"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onClear={() => { setQuery(""); setOpen(false); }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        aria-label={searchAria}
      />
      {!query && (
        <div
          className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center md:flex"
          aria-hidden
        >
          <kbd className="rounded border border-surface-border-subtle bg-surface-2 px-1.5 py-0.5 text-body-xs font-medium text-surface-fg-subtle">
            K
          </kbd>
        </div>
      )}
      {dropdownVisible && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-surface-border-subtle bg-surface-1 shadow-lg">
          {/* Deep link — pinned shortcut */}
          {deepLink && (
            <button
              type="button"
              onMouseDown={() => {
                fire("search_result_click", { query: query.trim(), result_slug: deepLink.toolSlug, rank: 0 });
                recordRecentSlug(deepLink.toolSlug);
                setOpen(false);
                setQuery("");
                router.push(deepLink.href);
              }}
              className="flex w-full items-center gap-3 border-b border-surface-border-subtle bg-[var(--bt-paper)] px-4 py-3 text-left transition-colors hover:bg-[var(--bt-paper-strong)]"
            >
              <span className="text-body-xs font-semibold text-[var(--bt-saffron-ink)]">Quick open</span>
              <span className="flex-1 truncate text-body-sm font-semibold text-surface-fg">{deepLink.label}</span>
              <ArrowRight className="size-4 shrink-0 text-[var(--bt-saffron-ink)]" aria-hidden />
            </button>
          )}

          {/* Recent tools — shown when no query */}
          {showRecent && (
            <div>
              <div className="flex items-center gap-1.5 border-b border-surface-border-subtle px-4 py-2">
                <Clock className="size-3 text-surface-fg-subtle" aria-hidden />
                <span className="text-body-xs font-medium text-surface-fg-subtle">Recent</span>
              </div>
              {recentTools.map((tool, i) => {
                const text = getToolText(tool, dict);
                return (
                  <button
                    key={tool.slug}
                    type="button"
                    onMouseDown={() => navigate(tool.href, tool.slug, i)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent-3 focus:bg-accent-3 focus:outline-none"
                  >
                    <ToolIcon kind={tool.iconKind} color={tool.iconColor} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-body-sm font-medium text-surface-fg">{text.name}</div>
                      <div className="truncate text-body-xs text-surface-fg-muted">{text.tagline}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Regular search results */}
          {query && results.map((tool, i) => {
            const text = getToolText(tool, dict);
            return (
              <button
                key={tool.slug}
                type="button"
                onMouseDown={() => navigate(tool.href, tool.slug, i)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent-3 focus:bg-accent-3 focus:outline-none"
              >
                <ToolIcon kind={tool.iconKind} color={tool.iconColor} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-body-sm font-medium text-surface-fg">{text.name}</div>
                  <div className="truncate text-body-xs text-surface-fg-muted">{text.tagline}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
