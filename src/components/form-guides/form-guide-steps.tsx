"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Step, Stepper, StepperContent } from "@devalok/shilp-sutra/ui/stepper";

export interface FormGuideStep {
  label: string;
  description?: string;
  content: React.ReactNode;
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
      <Stepper activeStep={activeStep}>
        {steps.map((step) => (
          <Step key={step.label} label={step.label} description={step.description} />
        ))}
      </Stepper>

      <div ref={panelRef} tabIndex={-1} className="mt-8 focus:outline-none">
        <StepperContent activeStep={activeStep}>
          <div key={steps[activeStep].label} className="space-y-4">
            {steps[activeStep].content}
          </div>
        </StepperContent>
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
