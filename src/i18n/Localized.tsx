import { cn } from "@/lib/utils";

/**
 * Renders both languages in the HTML and lets CSS reveal the active one.
 * Server-rendered content stays crawlable and there is no hydration flash.
 */
export function Localized({
  en,
  hi,
  className,
  as: Tag = "span",
}: {
  en: string;
  hi: string;
  className?: string;
  as?: "span" | "p" | "div";
}) {
  return (
    <Tag className={className}>
      <span lang="en" className="lang-en">
        {en}
      </span>
      <span lang="hi-Latn" className="lang-hi">
        {hi}
      </span>
    </Tag>
  );
}

export function LocalizedBlock({
  en,
  hi,
  className,
}: {
  en: string;
  hi: string;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <div lang="en" className="lang-en">
        {en}
      </div>
      <div lang="hi-Latn" className="lang-hi">
        {hi}
      </div>
    </div>
  );
}
