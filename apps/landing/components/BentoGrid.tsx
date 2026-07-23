import { Sparkles, Target, BarChart3, Zap, Layers, Command, CheckSquare, MessageSquare, Clock, Star, ArrowUpRight } from "lucide-react";

const BentoGrid = () => {
  return (
    <section id="features" className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md">
            <Zap className="h-3.5 w-3.5" />
            <span>Built-In Flowboard Engine</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Everything designed to make work flow effortlessly
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg">
            Flowboard combines deep personal focus mode with automated AI task decomposition and team activity feeds.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-2">
          {/* Feature 1: AI Task & Subtask Decomposition (Spans 2 Cols) */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-surface/70 p-8 shadow-[0_0_50px_rgba(99,102,241,0.1)] backdrop-blur-2xl transition-all duration-300 hover:border-brand-500/50 hover:shadow-[0_0_60px_rgba(99,102,241,0.25)] md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient text-white shadow-lg shadow-brand-500/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400">
                AI Powered
              </span>
            </div>

            <h3 className="mt-6 font-display text-2xl font-bold text-ink">
              1-Click AI Task & Subtask Generator
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Stop manually breaking down complex epics. Type any prompt inside a column or board, and Flowboard's AI decomposes it into structured tasks with subtask checklists and time estimates.
            </p>

            {/* Visual Widget Preview */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-surface-2/60 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-line/60 pb-3 text-xs font-medium text-muted">
                <span className="flex items-center gap-2 font-semibold text-ink">
                  <Sparkles className="h-4 w-4 text-brand-400" /> Goal: "Build Payment & Subscription Webhooks"
                </span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  AI Ready
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-line/60 bg-surface px-3 py-2.5 text-xs font-medium text-ink shadow-sm">
                  <span className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-brand-400" /> Handle invoice.payment_failed webhooks
                  </span>
                  <span className="rounded bg-surface-2 px-2 py-0.5 text-[10px] font-mono text-faint">3 subtasks</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-line/60 bg-surface px-3 py-2.5 text-xs font-medium text-ink shadow-sm">
                  <span className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-brand-400" /> Customer subscription billing portal
                  </span>
                  <span className="rounded bg-surface-2 px-2 py-0.5 text-[10px] font-mono text-faint">2 subtasks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: My Tasks & Personal Focus Mode */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-surface/70 p-8 shadow-[0_0_50px_rgba(245,158,11,0.08)] backdrop-blur-2xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-[0_0_60px_rgba(245,158,11,0.2)] md:col-span-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Target className="h-6 w-6" />
            </div>

            <h3 className="mt-6 font-display text-xl font-bold text-ink">
              Dedicated Focus Mode
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Filter assigned work across all your active boards into a unified personal workspace.
            </p>

            <div className="mt-6 space-y-2.5">
              <div className="flex items-center justify-between rounded-xl border border-line/60 bg-surface-2/60 p-3 text-xs">
                <span className="font-semibold text-ink">Assigned To Me</span>
                <span className="rounded-full bg-brand-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-400">
                  Cross-Board
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-line/60 bg-surface-2/60 p-3 text-xs">
                <span className="font-semibold text-ink">Starred Favorite Boards</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-400" /> Quick Access
                </span>
              </div>
            </div>
          </div>

          {/* Feature 3: AI Board Summaries */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-surface/70 p-8 shadow-[0_0_50px_rgba(59,130,246,0.08)] backdrop-blur-2xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_60px_rgba(59,130,246,0.2)] md:col-span-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BarChart3 className="h-6 w-6" />
            </div>

            <h3 className="mt-6 font-display text-xl font-bold text-ink">
              AI Board Progress Summary
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              1-click AI progress analysis summarizes completed milestones and flags bottlenecks.
            </p>

            <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs font-mono text-muted">
              <p className="text-emerald-400 font-bold">📊 Progress Summary</p>
              <p className="mt-1 text-faint">"14 tasks done, 3 in review. Main focus is billing module."</p>
            </div>
          </div>

          {/* Feature 4: Task Drawer with Subtasks & Activity Timeline (Spans 2 Cols) */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-surface/70 p-8 shadow-[0_0_50px_rgba(168,85,247,0.1)] backdrop-blur-2xl transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_60px_rgba(168,85,247,0.25)] md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Layers className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                Deep Management
              </span>
            </div>

            <h3 className="mt-6 font-display text-2xl font-bold text-ink">
              Subtask Checklists, Comments & Activity History
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Complete task control inside every card: organize subtask checkboxes, collaborate with team comments, and view complete audit timeline logs.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-ink">
              <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-2/60 px-3 py-2">
                <CheckSquare className="h-4 w-4 text-brand-400" /> Subtask Progress Bars
              </span>
              <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-2/60 px-3 py-2">
                <MessageSquare className="h-4 w-4 text-emerald-400" /> Task Comments
              </span>
              <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-2/60 px-3 py-2">
                <Clock className="h-4 w-4 text-blue-400" /> Activity History Log
              </span>
              <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-2/60 px-3 py-2">
                <Command className="h-4 w-4 text-purple-400" /> Cmd + K Search
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
