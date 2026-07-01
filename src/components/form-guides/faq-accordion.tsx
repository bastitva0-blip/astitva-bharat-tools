import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@devalok/shilp-sutra/ui/accordion";

export interface Faq {
  question: string;
  answer: string;
}

export function FaqAccordion({
  faqs,
  heading = "Frequently asked questions",
}: {
  faqs: Faq[];
  heading?: string;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-heading-md font-semibold">{heading}</h2>
      <Accordion type="multiple" className="mt-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.question} value={`faq-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent className="text-surface-fg-muted">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
