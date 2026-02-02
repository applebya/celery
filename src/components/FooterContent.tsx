import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How accurate are the tax estimates?",
    answer:
      "Tax estimates use 2026 projected federal and provincial/state brackets for Canada and the USA. They provide a reasonable approximation but don't account for all deductions, credits, or individual circumstances. Consult a tax professional for precise calculations.",
  },
  {
    question: "Is my data saved or shared?",
    answer:
      "All calculations happen locally in your browser. Your data is stored only on your device using localStorage and is never sent to any server. Celery works completely offline once loaded.",
  },
  {
    question: "How do I compare job offers?",
    answer:
      'Create multiple scenarios using the "+ Add" button, then click "Compare Scenarios" to see them side-by-side. The comparison shows take-home pay, effective hourly rate, and total hours worked to help you make informed decisions.',
  },
];

export function FooterContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mt-16 pt-12 border-t border-border/30">
      {/* How it works */}
      <section className="max-w-xl mx-auto mb-12">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 text-center">
          How it works
        </h2>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              1
            </span>
            <span>
              Enter your hourly rate or target salary, select your currency and
              location
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              2
            </span>
            <span>
              Adjust time off, work schedule, and tax settings to match your
              situation
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              3
            </span>
            <span>
              See your estimated annual take-home pay instantly, save scenarios
              to compare
            </span>
          </li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="max-w-xl mx-auto">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border/50 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/30 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    openFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Policy */}
      <section className="max-w-xl mx-auto mt-12 pt-8 border-t border-border/30">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 text-center">
          Privacy Policy
        </h2>
        <div className="text-sm text-muted-foreground space-y-3">
          <p>
            <strong className="text-foreground/80">
              Your data stays on your device.
            </strong>{" "}
            All calculations happen locally in your browser. Your salary
            information, scenarios, and settings are stored only in your
            browser's localStorage and are never transmitted to any server.
          </p>
          <p>
            <strong className="text-foreground/80">Analytics.</strong> We use
            PostHog to collect anonymous usage analytics (page views, feature
            usage) to improve the app. No personal or financial data is
            collected. You can opt out by using a browser extension like uBlock
            Origin.
          </p>
          <p>
            <strong className="text-foreground/80">No cookies.</strong> Celery
            does not use cookies for tracking. The only data stored is your
            calculator state in localStorage.
          </p>
          <p>
            <strong className="text-foreground/80">
              Third-party services.
            </strong>{" "}
            Exchange rates are fetched from the Frankfurter API. No personal
            data is sent with these requests.
          </p>
          <p className="text-xs text-muted-foreground/70 pt-2">
            Last updated: January 2026
          </p>
        </div>
      </section>
    </div>
  );
}
