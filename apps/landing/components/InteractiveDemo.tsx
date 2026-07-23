"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2, Bot, Clock, ShieldCheck, Zap, Layers, RefreshCw } from "lucide-react";

interface Preset {
  title: string;
  prompt: string;
  tasks: {
    todo: { title: string; tag: string; time: string }[];
    inProgress: { title: string; tag: string; time: string }[];
    done: { title: string; tag: string; time: string }[];
  };
}

const presets: Preset[] = [
  {
    title: "Launch SaaS Product",
    prompt: "Decompose a complete product hunt launch plan with subtasks & estimates",
    tasks: {
      todo: [
        { title: "Record 60s interactive demo video", tag: "Marketing", time: "2h" },
        { title: "Draft maker comment & hunter pitch", tag: "Copywriting", time: "45m" },
      ],
      inProgress: [
        { title: "Design social media thumbnail gallery", tag: "Design", time: "1.5h" },
      ],
      done: [
        { title: "Setup landing page tracking analytics", tag: "Engineering", time: "30m" },
        { title: "Prepare promo discount codes", tag: "Operations", time: "15m" },
      ],
    },
  },
  {
    title: "Payment Gateway Integration",
    prompt: "Generate subtasks for Stripe multi-tier subscription & webhook handlers",
    tasks: {
      todo: [
        { title: "Handle invoice.payment_failed webhooks", tag: "Backend", time: "3h" },
        { title: "Build customer portal billing UI", tag: "Frontend", time: "2h" },
      ],
      inProgress: [
        { title: "Implement Stripe Checkout session redirect", tag: "API", time: "1.5h" },
      ],
      done: [
        { title: "Database schema migration for user_subscriptions", tag: "Database", time: "45m" },
      ],
    },
  },
  {
    title: "Mobile App Redesign",
    prompt: "Break down iOS app dark mode redesign and component design tokens",
    tasks: {
      todo: [
        { title: "Audit contrast accessibility compliance", tag: "UX Audit", time: "1h" },
        { title: "Export micro-animation SVG vectors", tag: "Design", time: "2h" },
      ],
      inProgress: [
        { title: "Build dark mode CSS token architecture", tag: "Frontend", time: "4h" },
      ],
      done: [
        { title: "App icon variant explorations", tag: "Branding", time: "1h" },
      ],
    },
  },
];

const InteractiveDemo = () => {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const activeData = presets[selectedPreset];

  const handleSelect = (index: number) => {
    if (index === selectedPreset || isGenerating) return;
    setIsGenerating(true);
    setSelectedPreset(index);
    setTimeout(() => setIsGenerating(false), 350);
  };

  return (
    <section id="demo" className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-400 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive AI Playground</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Watch AI transform goals into structured backlogs
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg">
            Select an example goal below to simulate Flowboard's AI decomposition engine live.
          </p>
        </div>

        {/* Playground Container */}
        <div className="relative mt-14 overflow-hidden rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-[0_0_60px_rgba(99,102,241,0.15)] backdrop-blur-2xl sm:p-8">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 border-b border-line/60 pb-6">
            <span className="text-xs font-mono text-faint">Select Prompt Preset:</span>
            {presets.map((preset, idx) => (
              <button
                key={preset.title}
                onClick={() => handleSelect(idx)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  selectedPreset === idx
                    ? "brand-gradient text-white shadow-md shadow-brand-500/30 scale-[1.02]"
                    : "border border-white/10 bg-surface-2 text-muted hover:border-brand-500/40 hover:text-ink"
                }`}
              >
                <Bot className="h-3.5 w-3.5" />
                {preset.title}
              </button>
            ))}
          </div>

          {/* Prompt Input Bar */}
          <div className="relative mt-6">
            <div className="flex items-center gap-3 rounded-2xl border border-brand-500/30 bg-surface-2 px-4 py-3.5 shadow-inner">
              <Sparkles className="h-5 w-5 shrink-0 text-brand-400 animate-pulse" />
              <input
                readOnly
                value={activeData.prompt}
                className="w-full bg-transparent text-xs font-semibold text-ink focus:outline-none sm:text-sm"
              />
              <button
                disabled={isGenerating}
                onClick={() => handleSelect((selectedPreset + 1) % presets.length)}
                className="flex shrink-0 items-center gap-1.5 rounded-xl brand-gradient px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Decomposing...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Backlog</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Kanban Board Output Grid */}
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Column 1: To Do */}
            <div className="rounded-2xl border border-line/60 bg-surface-2/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  To Do
                </span>
                <span className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-bold text-faint">
                  {activeData.tasks.todo.length}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`todo-${selectedPreset}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  {activeData.tasks.todo.map((t) => (
                    <div
                      key={t.title}
                      className="rounded-xl border border-line bg-surface p-4 shadow-sm transition-all hover:border-brand-500/30"
                    >
                      <p className="text-xs font-semibold text-ink">{t.title}</p>
                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-400">
                          {t.tag}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-faint">
                          <Clock className="h-3 w-3" /> {t.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Column 2: In Progress */}
            <div className="rounded-2xl border border-line/60 bg-surface-2/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
                  In Progress
                </span>
                <span className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-bold text-faint">
                  {activeData.tasks.inProgress.length}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`inp-${selectedPreset}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, delay: 0.05 }}
                  className="space-y-3"
                >
                  {activeData.tasks.inProgress.map((t) => (
                    <div
                      key={t.title}
                      className="rounded-xl border border-blue-500/30 bg-surface p-4 shadow-sm ring-1 ring-blue-500/20"
                    >
                      <p className="text-xs font-semibold text-ink">{t.title}</p>
                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        <span className="rounded-md bg-blue-500/10 px-2 py-0.5 font-semibold text-blue-400">
                          {t.tag}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-faint">
                          <Clock className="h-3 w-3" /> {t.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Column 3: Done */}
            <div className="rounded-2xl border border-line/60 bg-surface-2/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Completed
                </span>
                <span className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-bold text-faint">
                  {activeData.tasks.done.length}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`done-${selectedPreset}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                  className="space-y-3"
                >
                  {activeData.tasks.done.map((t) => (
                    <div
                      key={t.title}
                      className="rounded-xl border border-emerald-500/20 bg-surface p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <p className="text-xs font-semibold text-ink line-through decoration-muted">{t.title}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-400">
                          {t.tag}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-faint">
                          <ShieldCheck className="h-3 w-3 text-emerald-400" /> Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
