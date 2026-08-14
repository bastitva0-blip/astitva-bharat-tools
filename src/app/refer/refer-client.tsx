"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Footer } from "@/components/footer";

const STEPS = [
  {
    title: "Share the referral link",
    body: "Send them /for-operators and mention your name or email.",
  },
  {
    title: "They buy the operator plan",
    body: "₹1,999/year. They mention your name at checkout (manual for now).",
  },
  {
    title: "You get 3 months free",
    body: "We add 3 months to your licence — no questions asked.",
  },
];

export function ReferClient() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/for-operators`
        : "https://bharattools.in/for-operators";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <main className="mx-auto w-full max-w-4xl px-page-x py-10">
        <PageHeader
          title="Refer an operator. Get 3 months free."
          subtitle="Know a cyber café, CSC, or photo studio that handles forms every day? If they buy the operator plan using your referral, we add 3 months to your licence."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Refer an operator" }]}
        />

        <section className="mt-16">
          <h2 className="text-heading-md font-semibold text-surface-fg">How it works</h2>
          <div className="mt-ds-05 grid gap-ds-04 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Card key={s.title} variant="outline" className="h-full">
                <CardHeader>
                  <CardTitle>
                    <span className="mr-2 text-surface-fg-subtle">{i + 1}.</span>
                    {s.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body-sm text-surface-fg-muted">{s.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-heading-md font-semibold text-surface-fg">Share the operator page</h2>
          <div className="mt-ds-05 flex flex-col gap-ds-04 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/for-operators">Share the operator page →</Link>
            </Button>
            <Button variant="outline" size="lg" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </div>
          <p className="mt-ds-04 text-body-sm text-surface-fg-subtle">
            Link: bharattools.in/for-operators
          </p>
        </section>

        <section className="mt-16 rounded-lg border border-surface-border-subtle bg-surface-2 p-ds-06">
          <p className="text-body-md text-surface-fg-muted">
            Referral tracking is manual right now. Email us at{" "}
            <a href="mailto:mudit@devalok.in" className="text-surface-fg hover:underline">
              mudit@devalok.in
            </a>{" "}
            after your referral buys — we'll verify and extend your licence the same day.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
