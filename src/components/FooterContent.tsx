import { useState } from "react";
import { ChevronDown, ArrowLeftRight, Zap, BarChart } from "lucide-react";

const faqs = [
  {
    question: "How accurate are the tax estimates?",
    answer:
      "Tax estimates use 2026 federal and provincial/state brackets for Canada and the USA. Regional taxes are approximate and don't account for all deductions, credits, or individual circumstances.",
  },
  {
    question: "How do extras and equity work?",
    answer:
      "Cash extras can be marked as taxable or non-taxable. Equity is treated as non-cash and shown as estimated annual value only (no tax impact).",
  },
  {
    question: "Is my data saved or shared?",
    answer:
      "All calculations happen locally in your browser. Your data is stored only on your device using localStorage and is never sent to any server.",
  },
  {
    question: "How do I compare job offers?",
    answer:
      'Create multiple scenarios using the "+ Add" button, then click "Compare" to see them side-by-side with take-home pay and effective hourly rates.',
  },
  {
    question: "How does currency conversion work?",
    answer:
      "When your pay currency differs from your tax residence currency, conversion happens automatically using live exchange rates. You can adjust the conversion margin to account for fees from your bank or payment provider.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Yes. Celery is a PWA that works offline after your first visit. Tax calculations and saved scenarios are fully local. Exchange rates are cached for 24 hours.",
  },
];

const steps = [
  {
    icon: Zap,
    title: "Enter rate",
    desc: "Hourly rate, salary, or retainer",
  },
  {
    icon: BarChart,
    title: "Customize",
    desc: "Schedule, time off, taxes",
  },
  {
    icon: ArrowLeftRight,
    title: "Compare",
    desc: "Save multiple scenarios, compare side-by-side",
  },
];

export function FooterContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mt-16 pt-10 border-t border-border/30">
      {/* Two-column layout: How it works + Privacy — hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-2 gap-10 md:gap-16 mb-10">
        {/* Left: How it works */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
            How it works
          </h2>
          <div className="flex gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex-1">
                <step.icon className="h-5 w-5 text-primary mb-2" />
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Privacy */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Privacy
          </h2>
          <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
            <p>
              <span className="text-foreground/80 font-medium">
                Local only.
              </span>{" "}
              All calculations happen in your browser. Data stays in
              localStorage, never transmitted to any server.
            </p>
            <p>
              <span className="text-foreground/80 font-medium">Analytics.</span>{" "}
              Anonymous usage analytics via PostHog. No personal or financial
              data collected.
            </p>
            <p>
              <span className="text-foreground/80 font-medium">
                No cookies.
              </span>{" "}
              No tracking cookies. Exchange rates fetched from Frankfurter API
              without personal data.
            </p>
          </div>
        </section>
      </div>

      {/* Full-width FAQ */}
      <section className="md:border-t border-border/30 md:pt-8">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
          FAQ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border/30 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm hover:bg-muted/30 transition-colors"
              >
                <span className="text-muted-foreground hover:text-foreground pr-2">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                    openFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
