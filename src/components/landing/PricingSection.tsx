import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, Zap, Shield, HelpCircle } from "lucide-react";

interface Plan {
  name: string;
  badge?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
  ctaLink: string;
}

const plans: Plan[] = [
  {
    name: "Free Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for solo creators & developers exploring smart task management.",
    features: [
      "Up to 3 active Kanban boards",
      "5 AI Task Breakdowns / month",
      "Personal Focus View",
      "Standard subtask checklists",
      "Community support",
    ],
    ctaText: "Start for Free",
    ctaLink: "/register",
  },
  {
    name: "Pro AI",
    badge: "Most Popular",
    popular: true,
    monthlyPrice: 12,
    yearlyPrice: 9,
    description: "For power users & small teams building products with high velocity.",
    features: [
      "Unlimited Kanban boards & columns",
      "Unlimited AI Backlog Generation",
      "AI Sprint Summaries & Analytics",
      "Priority status tags & custom fields",
      "Real-time team collaboration",
      "Priority 24/7 support",
    ],
    ctaText: "Start 14-Day Free Trial",
    ctaLink: "/register?plan=pro",
  },
  {
    name: "Team Enterprise",
    monthlyPrice: 29,
    yearlyPrice: 24,
    description: "For growing organizations requiring security, RBAC & custom workflows.",
    features: [
      "Everything in Pro AI",
      "Unlimited team member seats",
      "Role-Based Access Control (RBAC)",
      "Audit logs & SAML SSO",
      "Dedicated Customer Success Manager",
      "Custom SLA & Uptime Guarantee",
    ],
    ctaText: "Contact Sales",
    ctaLink: "/register?plan=enterprise",
  },
];

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="relative px-4 py-24 sm:px-6 lg:px-8 bg-surface-2/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
            <Zap className="h-3.5 w-3.5" />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Choose the plan that fits your growth
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
            Start for free, upgrade when you need unlimited AI breakdown capabilities.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${!isYearly ? "text-ink" : "text-muted"}`}>
              Monthly billing
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isYearly ? "bg-brand-500" : "bg-line"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isYearly ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`flex items-center gap-1.5 text-xs font-semibold ${isYearly ? "text-ink" : "text-muted"}`}>
              Annual billing
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-8">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 ${
                  plan.popular
                    ? "border-2 border-brand-500 bg-surface shadow-[var(--shadow-lift)] ring-4 ring-brand-500/10 scale-[1.02]"
                    : "border border-line bg-surface/80 hover:border-brand-500/30 shadow-[var(--shadow-card)]"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full brand-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                      <Sparkles className="h-3 w-3" /> {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="font-display text-xl font-bold text-ink">{plan.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted min-h-[36px]">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1 border-b border-line pb-6">
                    <span className="font-display text-4xl font-extrabold tracking-tight text-ink">
                      ${price}
                    </span>
                    <span className="text-xs font-medium text-muted">
                      {price === 0 ? "forever" : isYearly ? "/month (billed yearly)" : "/month"}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="mt-6 space-y-3 text-xs text-muted">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="text-ink">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    to={plan.ctaLink}
                    className={`block w-full rounded-2xl py-3 text-center text-xs font-bold transition-all duration-200 ${
                      plan.popular
                        ? "brand-gradient text-white shadow-md shadow-brand-500/25 hover:opacity-95"
                        : "border border-line bg-surface-2 text-ink hover:bg-surface-3"
                    }`}
                  >
                    {plan.ctaText}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
