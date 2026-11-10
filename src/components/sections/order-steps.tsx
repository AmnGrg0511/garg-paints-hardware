import { orderSteps } from "@/config/content";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/sections/section-heading";

const accents = [
  "bg-secondary text-secondary-foreground",
  "bg-primary/10 text-primary",
  "bg-accent text-accent-foreground",
];

export function OrderSteps() {
  return (
    <section
      className="container-page py-16 sm:py-24"
      aria-labelledby="order-steps-heading"
    >
      <SectionHeading
        id="order-steps-heading"
        eyebrow="How ordering works"
        title="Three steps, no payment gateway."
        body="This site is an order-enquiry layer. You choose the channel, and the team confirms availability and the final GST invoice directly."
        align="center"
      />

      <ol className="mt-9 grid gap-4 md:grid-cols-3">
        {orderSteps.map((step, index) => (
          <li
            key={step.title}
            className="surface-card relative flex flex-col rounded-2xl p-6"
          >
            <span
              className={cn(
                "grid size-10 place-items-center rounded-full text-base font-extrabold",
                accents[index % accents.length],
              )}
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-xl font-bold tracking-tight">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
