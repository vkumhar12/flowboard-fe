"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does the AI task decomposition feature work?",
    answer: "Flowboard utilizes advanced natural language models trained specifically on Agile and SaaS project backlogs. Simply describe a high-level feature or goal (e.g. 'Build Stripe Subscriptions'), and Flowboard will break it down into actionable subtasks with time estimates and priority tags.",
  },
  {
    question: "Can I migrate my existing boards from Trello or Jira?",
    answer: "Yes! Flowboard supports 1-click JSON and CSV imports from Trello, Jira, and Asana so you can bring your existing workflows over seamlessly in seconds.",
  },
  {
    question: "Is there a limit on how many team members I can invite?",
    answer: "The Free Starter plan allows 1 user. The Pro AI plan supports small collaborative teams, while the Team Enterprise plan offers unlimited team seats with custom Role-Based Access Controls (RBAC).",
  },
  {
    question: "What happens after my 14-day free trial?",
    answer: "At the end of your 14-day trial, you can choose to subscribe to the Pro AI or Enterprise plan. If you choose not to subscribe, your account will automatically convert to the Free Starter plan without losing any of your data.",
  },
  {
    question: "Is my data secure and private?",
    answer: "Security is our top priority. Flowboard uses end-to-end TLS 1.3 encryption in transit, AES-256 at rest via Neon Postgres serverless database, and strict JWT authentication.",
  },
];

const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
            Everything you need to know about Flowboard features, AI limits, and plans.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-line bg-surface/80 transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-ink hover:text-brand-500"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-line/60 px-5 pb-5 pt-3 text-xs leading-relaxed text-muted">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
