import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { ReferClient } from "./refer-client";

export const metadata = {
  title: "Refer an operator — earn 3 months free",
  description:
    "Refer a cyber café, CSC, or photo studio to BharatTools. When they buy the operator plan, you get 3 months added to your licence.",
  alternates: { canonical: "/refer" },
};

export default function ReferPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ label: "Home", href: "/" }, { label: "Refer an operator" }])}
      />
      <ReferClient />
    </>
  );
}
