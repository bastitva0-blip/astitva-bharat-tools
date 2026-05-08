interface Props {
  data: object | object[];
}

export function JsonLd({ data }: Props) {
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
