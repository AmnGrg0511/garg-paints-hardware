import { serializeJsonLd, type JsonLdInput } from "@/lib/schema";

/**
 * Renders sanitised JSON-LD from a Server Component. Data is serialised with
 * `<`, `>`, `&` and line separators escaped before it touches the document.
 */
export function SEO({ data }: { data: JsonLdInput }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
