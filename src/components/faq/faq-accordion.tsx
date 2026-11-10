import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FaqAccordion({
  faqs,
  className,
}: {
  faqs: readonly { question: string; answer: string }[];
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-border/70", className)}>
      {faqs.map((faq) => (
        <details key={faq.question} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-[0.98rem] font-semibold text-foreground [&::-webkit-details-marker]:hidden">
            <span>{faq.question}</span>
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border/80 bg-card text-muted-foreground transition-transform duration-200 group-open:rotate-45">
              <PlusIcon className="size-4" aria-hidden />
            </span>
          </summary>
          <div className="pb-5 pr-10 text-sm leading-relaxed text-muted-foreground">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
