"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";

export interface FormGuideStep {
  label: string;
  description?: string;
  content: React.ReactNode;
}

// Raw stepper indicator — deliberately not the shilp-sutra <Stepper>, which
// pulls in framer-motion for its content-transition animation. That extra
// chunk has to be fetched and parsed before the step indicator can respond,
// which reads as lag on slow connections. This reimplements the same visual
// (same design tokens/colors) with plain Tailwind + CSS transitions only —
// no animation library, no per-step JS work.
function StepIndicator({
  steps,
  activeStep,
  onSelect,
}: {
  steps: FormGuideStep[];
  activeStep: number;
  onSelect: (index: number) => void;
}) {
  const stripRef = useRef<HTMLElement | null>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const mountedRef = useRef(false);

  // Six steps of labelled circles do not fit on a phone. Rather than truncate
  // or wrap them into an unreadable grid, the strip scrolls sideways and the
  // current step is kept centred — so "where am I in this?" stays answerable
  // at any width.
  //
  // Deliberately not `scrollIntoView`: that walks every scrollable ancestor
  // including the document, so it would move the whole page — on mount (the
  // stepper sits well below the fold on a guide page, so a refresh would yank
  // the viewport) and against the `panelRef.focus()` in `goTo`, which has
  // already scrolled the panel into view. Setting `scrollLeft` on the strip
  // touches nothing outside it. Rects rather than `offsetLeft` because the
  // strip is not the button's offsetParent.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const strip = stripRef.current;
    const step = activeRef.current;
    if (!strip || !step) return;

    const stripBox = strip.getBoundingClientRect();
    const stepBox = step.getBoundingClientRect();
    const offCentre =
      stepBox.left + stepBox.width / 2 - (stripBox.left + stripBox.width / 2);

    strip.scrollTo({
      left: strip.scrollLeft + offCentre,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [activeStep]);

  return (
    <nav
      ref={stripRef}
      aria-label="Guide steps"
      className="-mx-page-x flex flex-row items-center gap-ds-02 overflow-x-auto px-page-x pb-ds-02"
    >
      {steps.map((step, index) => {
        const state = index < activeStep ? "completed" : index === activeStep ? "active" : "pending";
        return (
          <div key={step.label} className="contents">
            {/* Every step is reachable, not just the next one. This is
                reference material, not a wizard with validation — someone who
                already has their photo sorted should be able to jump straight
                to the fee step. A numbered circle that looks pressable and
                isn't is the worst of both.

                No `role="listitem"` here, and no `role="list"` on the strip: an
                explicit role replaces the element's implicit one, so it would
                announce "Step 3: Fee, upcoming" as a list item with no hint
                that it does anything. The <nav> label carries the grouping
                instead. */}
            <button
              type="button"
              ref={index === activeStep ? activeRef : undefined}
              onClick={() => onSelect(index)}
              className="bt-pressable flex shrink-0 items-center gap-ds-03 rounded-md p-ds-01 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-7"
              aria-current={state === "active" ? "step" : undefined}
              aria-label={`Step ${index + 1}: ${step.label}, ${
                state === "completed" ? "completed" : state === "active" ? "current" : "upcoming"
              }`}
            >
              <span
                className={`flex h-ds-sm w-ds-sm shrink-0 items-center justify-center rounded-pill text-ds-sm font-semibold transition-colors duration-moderate-01 ease-productive-standard ${
                  state === "pending"
                    ? "border border-surface-border-strong bg-surface-raised text-surface-fg-subtle"
                    : "bg-accent-9 text-accent-fg"
                }`}
              >
                {state === "completed" ? (
                  <Check className="h-ico-sm w-ico-sm" strokeWidth={2.5} aria-hidden />
                ) : (
                  index + 1
                )}
              </span>
              <span className="flex flex-col">
                <span
                  className={`text-ds-md font-medium leading-ds-snug ${
                    state === "pending" ? "text-surface-fg-subtle" : "text-surface-fg"
                  }`}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-ds-sm text-surface-fg-muted leading-ds-relaxed">
                    {step.description}
                  </span>
                )}
              </span>
            </button>

            {index < steps.length - 1 && (
              <div
                className="relative h-ds-01 min-w-ds-05 flex-1 overflow-hidden bg-surface-border"
                aria-hidden="true"
              >
                <div
                  className="absolute inset-0 origin-left bg-accent-9 transition-transform duration-moderate-02 ease-productive-standard"
                  style={{ transform: `scaleX(${index < activeStep ? 1 : 0})` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function FormGuideSteps({ steps }: { steps: FormGuideStep[] }) {
  const [activeStep, setActiveStep] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const isFirst = activeStep === 0;
  const isLast = activeStep === steps.length - 1;

  function goTo(index: number) {
    setActiveStep(index);
    panelRef.current?.focus();
  }

  return (
    <div>
      <StepIndicator steps={steps} activeStep={activeStep} onSelect={goTo} />

      <div ref={panelRef} tabIndex={-1} className="mt-8 focus:outline-none">
        <div key={steps[activeStep].label} className="space-y-4">
          {steps[activeStep].content}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-surface-border-subtle pt-6">
        <Button
          variant="soft"
          onClick={() => goTo(activeStep - 1)}
          disabled={isFirst}
          startIcon={<ArrowLeft className="size-4" aria-hidden />}
        >
          Previous
        </Button>
        <span className="text-body-sm text-surface-fg-muted">
          Step {activeStep + 1} of {steps.length}
        </span>
        <Button
          variant="soft"
          onClick={() => goTo(activeStep + 1)}
          disabled={isLast}
          endIcon={<ArrowRight className="size-4" aria-hidden />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
