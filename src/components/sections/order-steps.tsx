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
        eyebrow={{ en: "How ordering works", hi: "ऑर्डरिंग कैसे होती है" }}
        title={{ en: "Three steps, no payment gateway.", hi: "तीन steps, कोई payment gateway नहीं।" }}
        body={{ en: "This site is an order-enquiry layer. You choose the channel, and the team confirms availability and your best final rate directly.", hi: "यह site ऑर्डर-पूछताछ का माध्यम है। आप channel चुनें, और टीम उपलब्धता व आपका बेस्ट रेट सीधे कन्फ़र्म करेगी।" }}
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
