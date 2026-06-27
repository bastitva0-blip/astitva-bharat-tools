import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent } from "@devalok/shilp-sutra/ui/card";

interface LanderPricingProps {
  segment: "operator" | "professional";
}

export function LanderPricing({ segment }: LanderPricingProps) {
  const planLabel = segment === "operator" ? "Operator plan" : "Professional plan";
  const mailto = `mailto:mudit@devalok.in?subject=${encodeURIComponent(planLabel)}`;
  return (
    <section id="pricing" className="mt-16 scroll-mt-24">
      <Card variant="outline">
        <CardContent className="space-y-4 py-ds-06">
          <div>
            <div className="text-heading-lg font-semibold text-surface-fg">
              ₹1,999 / year
            </div>
            <p className="mt-1 text-body-md text-surface-fg-muted">
              UPI. One time. Commercial-use licence. Unlimited batch. Tied to this device.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <a href={mailto}>Get the {planLabel.toLowerCase()}</a>
            </Button>
            <span className="text-body-xs text-surface-fg-subtle">
              Self-serve UPI checkout is on the way. Until then, we'll set you up by email.
            </span>
          </div>
          <p className="text-body-xs text-surface-fg-subtle">
            Receipt emailed. No auto-renew. No card stored.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
