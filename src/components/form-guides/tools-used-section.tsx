import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";

export interface RelatedTool {
  href: string;
  title: string;
  description: string;
}

export function RelatedToolCard({ href, title, description }: RelatedTool) {
  return (
    <Link href={href} className="bt-pressable block rounded-md">
      <Card variant="outline" interactive className="h-full">
        <CardHeader>
          <CardTitle className="text-body-md">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm text-surface-fg-muted">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ToolsUsedSection({
  tools,
  heading = "Tools used in this guide",
}: {
  tools: RelatedTool[];
  heading?: string;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-heading-md font-semibold">{heading}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {tools.map((tool) => (
          <RelatedToolCard key={`${tool.href}-${tool.title}`} {...tool} />
        ))}
      </div>
    </section>
  );
}
