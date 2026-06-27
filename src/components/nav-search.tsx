"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@devalok/shilp-sutra/ui/dialog";
import { SearchInput } from "@devalok/shilp-sutra/ui/search-input";
import { ToolIcon } from "@/components/tool-icon";
import { useT } from "@/i18n/provider";
import { fire } from "@/lib/analytics/events";
import { resolveDeepLink, searchTools, type SearchOutcome } from "@/lib/search";
import { getToolText } from "@/lib/tool-text";
import { tools } from "@/lib/tools";

const EMPTY_OUTCOME: SearchOutcome = { results: tools, mode: "all" };

function isTextEntryTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

export function NavSearch() {
  const dict = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState<SearchOutcome>(EMPTY_OUTCOME);
  const [, startTransition] = useTransition();
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const openedRef = useRef(false);
  const lastFiredQueryRef = useRef<string>("");
  const lastDeepLinkRef = useRef<string | null>(null);
  const [mac, setMac] = useState(false);

  useEffect(() => setMac(isMac()), []);

  const trimmed = query.trim();
  const deepLink = useMemo(() => resolveDeepLink(query), [query]);
  const showDeep = Boolean(deepLink);
  const flatLen = (showDeep ? 1 : 0) + outcome.results.length;

  const openPalette = useCallback(() => {
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  // Global keyboard: Cmd/Ctrl+K or "/" to open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmdK = (e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey);
      const slash = e.key === "/" && !isTextEntryTarget(e.target);
      if (cmdK || slash) {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPalette]);

  // Reset state + fire search_opened when dialog opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setOutcome(EMPTY_OUTCOME);
      setActiveIndex(0);
      openedRef.current = false;
      lastFiredQueryRef.current = "";
      lastDeepLinkRef.current = null;
    }
  }, [open]);

  const markOpened = () => {
    if (openedRef.current) return;
    openedRef.current = true;
    fire("search_opened", { surface: "nav" });
  };

  const onChange = (value: string) => {
    setQuery(value);
    markOpened();
    setActiveIndex(0);
    startTransition(() => setOutcome(searchTools(value)));
  };

  // Fire search_query (debounced 300ms after typing pause)
  useEffect(() => {
    if (!open) return;
    if (!trimmed || trimmed === lastFiredQueryRef.current) return;
    const id = window.setTimeout(() => {
      lastFiredQueryRef.current = trimmed;
      const hadResults = outcome.mode === "primary" || outcome.mode === "fuzzy";
      fire("search_query", { query_length: trimmed.length, had_results: hadResults });
      if (!hadResults) fire("search_zero_result", { query: trimmed });
    }, 300);
    return () => window.clearTimeout(id);
  }, [open, trimmed, outcome.mode]);

  // Fire search_deep_link once per resolved target
  useEffect(() => {
    if (!open || !deepLink) {
      lastDeepLinkRef.current = null;
      return;
    }
    if (lastDeepLinkRef.current === deepLink.href) return;
    lastDeepLinkRef.current = deepLink.href;
    fire("search_deep_link", { query: trimmed, target: deepLink.href });
  }, [open, deepLink, trimmed]);

  const navigateTo = (href: string, opts: { kind: "deep" | "result"; slug?: string; rank?: number }) => {
    if (opts.kind === "deep") {
      fire("search_result_click", {
        query: trimmed,
        result_slug: deepLink?.toolSlug ?? "deep-link",
        rank: 0,
      });
    } else if (opts.slug) {
      fire("search_result_click", {
        query: trimmed,
        result_slug: opts.slug,
        rank: opts.rank ?? 0,
      });
    }
    close();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (flatLen === 0 ? 0 : (i + 1) % flatLen));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (flatLen === 0 ? 0 : (i - 1 + flatLen) % flatLen));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatLen === 0) return;
      if (showDeep && activeIndex === 0 && deepLink) {
        navigateTo(deepLink.href, { kind: "deep" });
        return;
      }
      const resultIdx = activeIndex - (showDeep ? 1 : 0);
      const tool = outcome.results[resultIdx];
      if (tool) navigateTo(tool.href, { kind: "result", slug: tool.slug, rank: resultIdx });
    }
  };

  // Scroll the active item into view when activeIndex changes
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="hidden h-9 items-center gap-2 rounded-md border border-surface-border-subtle bg-surface-1 px-3 text-body-sm text-surface-fg-muted transition-colors hover:bg-accent-3 hover:text-accent-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-7 md:inline-flex md:min-w-[220px]"
        aria-label={dict.nav.searchTrigger}
      >
        <Search size={14} aria-hidden />
        <span className="flex-1 text-left">{dict.nav.searchTrigger}</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-surface-border-subtle bg-surface-2 px-1.5 py-0.5 text-body-xs font-medium text-surface-fg-subtle lg:inline-flex">
          {mac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>

      <button
        type="button"
        onClick={openPalette}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-surface-fg-muted transition-colors hover:bg-accent-3 hover:text-accent-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-7 md:hidden"
        aria-label={dict.nav.searchTrigger}
      >
        <Search size={18} aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{dict.nav.searchTrigger}</DialogTitle>
            <DialogDescription>{dict.nav.searchEmpty}</DialogDescription>
          </DialogHeader>
          <div className="border-b border-surface-border-subtle p-ds-03">
            <SearchInput
              ref={inputRef}
              autoFocus
              size="lg"
              value={query}
              onChange={(e) => onChange(e.target.value)}
              onClear={() => onChange("")}
              onKeyDown={onKeyDown}
              placeholder={dict.tools.searchPlaceholder}
              aria-label={dict.tools.searchAria}
            />
          </div>

          <ul
            ref={listRef}
            className="max-h-[60vh] overflow-y-auto p-ds-02"
            role="listbox"
          >
            {showDeep && deepLink && (
              <li
                data-idx={0}
                role="option"
                aria-selected={activeIndex === 0}
                onMouseEnter={() => setActiveIndex(0)}
                onClick={() => navigateTo(deepLink.href, { kind: "deep" })}
                className={
                  "flex cursor-pointer items-center gap-3 rounded-md px-ds-03 py-ds-03 text-body-sm " +
                  (activeIndex === 0
                    ? "bg-accent-3 text-accent-12"
                    : "text-surface-fg hover:bg-accent-3")
                }
              >
                <ArrowRight size={16} className="text-accent-11" aria-hidden />
                <span className="text-surface-fg-muted">{dict.tools.deepLinkPrefix}</span>
                <span className="font-medium">{deepLink.label}</span>
                <span aria-hidden className="ml-auto">↵</span>
              </li>
            )}

            {outcome.mode === "fuzzy" || outcome.mode === "fallback" ? (
              trimmed && (
                <li className="px-ds-03 py-ds-02 text-body-xs uppercase tracking-wider text-surface-fg-subtle">
                  {outcome.mode === "fuzzy" ? dict.tools.fuzzyHeading : dict.tools.closestHeading}{" "}
                  “{trimmed}”
                </li>
              )
            ) : null}

            {outcome.results.length === 0 ? (
              <li className="px-ds-03 py-ds-04 text-center text-body-sm text-surface-fg-muted">
                {dict.nav.searchEmpty}
              </li>
            ) : (
              outcome.results.map((tool, i) => {
                const text = getToolText(tool, dict);
                const idx = (showDeep ? 1 : 0) + i;
                const live = tool.status === "live";
                return (
                  <li
                    key={tool.slug}
                    data-idx={idx}
                    role="option"
                    aria-selected={activeIndex === idx}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => navigateTo(tool.href, { kind: "result", slug: tool.slug, rank: i })}
                    className={
                      "flex cursor-pointer items-center gap-3 rounded-md px-ds-03 py-ds-03 " +
                      (activeIndex === idx
                        ? "bg-accent-3 text-accent-12"
                        : "text-surface-fg hover:bg-accent-3") +
                      (live ? "" : " opacity-70")
                    }
                  >
                    <ToolIcon kind={tool.iconKind} color={tool.iconColor} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-body-sm font-medium">
                        {text.name}{" "}
                        {!live && (
                          <span className="ml-1 text-body-xs text-surface-fg-subtle">
                            ({dict.tools.soon})
                          </span>
                        )}
                      </div>
                      <div className="truncate text-body-xs text-surface-fg-muted">
                        {text.tagline}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          <div className="flex items-center justify-between gap-3 border-t border-surface-border-subtle bg-surface-2 px-ds-04 py-ds-02 text-body-xs text-surface-fg-subtle">
            <button
              type="button"
              onClick={() => {
                close();
                router.push("/tools");
              }}
              className="font-medium text-accent-11 hover:underline"
            >
              {dict.tools.seeAll} →
            </button>
            <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-surface-border-subtle bg-surface-1 px-1">↑</kbd>
              <kbd className="rounded border border-surface-border-subtle bg-surface-1 px-1">↓</kbd>
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-surface-border-subtle bg-surface-1 px-1">
                <CornerDownLeft size={10} aria-hidden />
              </kbd>
              open
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-surface-border-subtle bg-surface-1 px-1">esc</kbd>
              close
            </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
