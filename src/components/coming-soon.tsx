import Link from "next/link";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent } from "@devalok/shilp-sutra/ui/card";
import { Badge } from "@devalok/shilp-sutra/ui/badge";

interface Props {
  description: string;
  highlights?: string[];
}

export function ComingSoon({ description, highlights }: Props) {
  return (
    <Card variant="outline" className="mt-8">
      <CardContent className="flex flex-col items-start gap-4 py-12">
        <Badge color="warning">In development</Badge>
        <p className="max-w-xl text-body-md text-surface-fg">{description}</p>
        {highlights && (
          <ul className="space-y-1 text-body-sm text-surface-fg-muted">
            {highlights.map((h) => (
              <li key={h} className="before:mr-2 before:text-accent-9 before:content-['✦']">
                {h}
              </li>
            ))}
          </ul>
        )}
        <Button asChild variant="soft" size="md">
          <Link href="/">Browse other tools</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
