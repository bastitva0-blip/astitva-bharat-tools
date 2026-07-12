"use client";

import { useRef, useState } from "react";
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
function StepIndicator({ steps, activeStep }: { steps: FormGuideStep[]; activeStep: number }) {
  return (
    <div className="flex flex-row items-center gap-ds-02" role="list">
      {steps.map((step, index) => {
        const state = index < activeStep ? "completed" : index === activeStep ? "active" : "pending";
        return (
          <div key={step.label} className="contents">
            <div
              className="flex items-center gap-ds-03"
              role="listitem"
              aria-current={state === "active" ? "step" : undefined}
              aria-label={`Step ${index + 1}: ${step.label}, ${
                state === "completed" ? "completed" : state === "active" ? "current" : "upcoming"
              }`}
            >
              <div
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
              </div>
              <div className="flex flex-col">
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
              </div>
            </div>

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
    </div>
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
      <StepIndicator steps={steps} activeStep={activeStep} />

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
