"use client";

import { useState, useEffect, useRef } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { dashboardHref } from "../lib/dashboard";
import {
  Sparkles,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Clock,
  CheckSquare,
  Search,
  Zap,
  TrendingUp,
  Star,
  GripVertical,
} from "lucide-react";

interface CardData {
  title: string;
  priority: string;
  priorityBg: string;
  subtasks: string;
  assignee: string;
  color: string;
}

const CARDS: Record<number, CardData> = {
  1: { title: "Implement Stripe Webhooks", priority: "Urgent", priorityBg: "bg-rose-500/10 text-rose-400 border-rose-500/20", subtasks: "2/4", assignee: "VK", color: "#f43f5e" },
  2: { title: "Design Dark Mode UI Kit", priority: "High", priorityBg: "bg-amber-500/10 text-amber-400 border-amber-500/20", subtasks: "1/2", assignee: "AL", color: "#f59e0b" },
  3: { title: "AI Backlog Decomposition Engine", priority: "Urgent", priorityBg: "bg-rose-500/10 text-rose-400 border-rose-500/20", subtasks: "3/3", assignee: "VK", color: "#6366f1" },
  4: { title: "JWT Auth & Neon DB Schema", priority: "Medium", priorityBg: "bg-blue-500/10 text-blue-400 border-blue-500/20", subtasks: "5/5", assignee: "RS", color: "#3b82f6" },
  5: { title: "Realtime Socket.IO Sync", priority: "High", priorityBg: "bg-purple-500/10 text-purple-400 border-purple-500/20", subtasks: "4/4", assignee: "AL", color: "#a855f7" },
};

const COLUMNS = [
  { key: "To Do", title: "To Do", color: "#6366f1" },
  { key: "In Progress", title: "In Progress", color: "#3b82f6" },
  { key: "Done", title: "Done", color: "#10b981" },
] as const;

type ColumnKey = "To Do" | "In Progress" | "Done";

const initialBoard: Record<ColumnKey, number[]> = {
  "To Do": [1, 2],
  "In Progress": [3],
  "Done": [4, 5],
};

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

const Hero = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [board, setBoard] = useState<Record<ColumnKey, number[]>>(initialBoard);
  const [movingId, setMovingId] = useState<number | null>(null);
  const [lastMovedTitle, setLastMovedTitle] = useState<string | null>(null);

  const boardRef = useRef(initialBoard);
  const sourceRef = useRef(0);

  useEffect(() => {
    const onVisibilityChange = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // Shared Layout Animation loop (like Login's KanbanDemo)
  useEffect(() => {
    if (!isVisible) return;

    const intervalId = setInterval(() => {
      const prev = boardRef.current;
      let s = sourceRef.current;
      let guard = 0;

      while (prev[COLUMNS[s].key].length === 0 && guard < COLUMNS.length) {
        s = (s + 1) % COLUMNS.length;
        guard += 1;
      }

      const src = COLUMNS[s].key;
      if (prev[src].length === 0) return;

      const dst = COLUMNS[(s + 1) % COLUMNS.length].key;
      const moving = prev[src][0];
      sourceRef.current = (s + 1) % COLUMNS.length;

      const next = {
        ...prev,
        [src]: prev[src].slice(1),
        [dst]: [...prev[dst], moving],
      };

      boardRef.current = next;
      setBoard(next);
      setMovingId(moving);
      setLastMovedTitle(CARDS[moving]?.title || null);
    }, 2400);

    return () => clearInterval(intervalId);
  }, [isVisible]);

  useEffect(() => {
    if (movingId == null) return;
    const timer = setTimeout(() => setMovingId(null), 800);
    return () => clearTimeout(timer);
  }, [movingId]);

  const repeatVal = isVisible ? Infinity : 0;

  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-8 sm:px-6 sm:pb-36 sm:pt-14">
      {/* Background Mesh & Radial Ambient Light */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Grid Background Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Floating Glowing Neon Spheres */}
        <motion.div
          className="absolute -top-40 left-1/2 h-[38rem] w-[56rem] -translate-x-1/2 rounded-[50%] blur-3xl opacity-40 dark:opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.8) 0%, rgba(168,85,247,0.5) 40%, rgba(6,182,212,0.2) 70%, transparent 100%)",
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 12, repeat: repeatVal, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 left-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: repeatVal, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/4 right-10 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: repeatVal, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Hero Copy Container */}
        <div className="text-center">
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-ink shadow-[0_0_20px_rgba(99,102,241,0.15)] backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            <span className="tracking-wide">Flowboard 2.0 • Fluid Drag & Drop Kanban</span>
            <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-300">
              Live Demo
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 font-display text-4xl font-black tracking-tight text-ink sm:text-6xl lg:text-7xl leading-[1.08]"
          >
            Turn High-Level Goals into{" "}
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
              Shipped Work
            </span>{" "}
            with AI
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-muted sm:text-xl"
          >
            Flowboard automatically decomposes complex project targets into structured Kanban backlogs, subtask checklists, and personal focus views in seconds.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a href={dashboardHref("/register")} className="w-full sm:w-auto">
              <button className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl brand-gradient px-8 py-4 text-sm font-bold text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] active:scale-95">
                <span className="relative z-10 flex items-center gap-2">
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </button>
            </a>
            <a href="#demo" className="w-full sm:w-auto">
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-surface/60 px-8 py-4 text-sm font-bold text-ink backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-surface-2">
                <PlayCircle className="h-4 w-4 text-brand-400" />
                <span>Interactive Playground</span>
              </button>
            </a>
          </motion.div>
        </div>

        {/* ── HIGH FIDO APP MOCKUP WINDOW WITH SHARED LAYOUT DRAG ANIMATION ── */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16 sm:mt-20"
        >
          {/* Glowing Glass Frame Container */}
          <div className="relative rounded-3xl border border-white/10 bg-surface/70 p-3 shadow-[0_0_80px_rgba(99,102,241,0.2)] backdrop-blur-2xl sm:p-4">
            {/* Browser Header Bar */}
            <div className="flex items-center justify-between border-b border-line/60 pb-3 px-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-4 py-1 text-[11px] font-mono text-faint border border-line/40">
                <span>flowboard.app/workspace/sprint-24</span>
              </div>
              <div className="flex items-center gap-2 text-faint">
                <Search className="h-3.5 w-3.5" />
                <span className="text-[10px] font-mono border border-line rounded px-1.5 py-0.5">Cmd + K</span>
              </div>
            </div>

            {/* Board Header Preview */}
            <div className="mt-4 flex flex-wrap items-center justify-between px-3 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 font-bold text-xs">
                  S24
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-ink">Q3 SaaS Sprint Backlog</h3>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-faint">13 active tasks • Live shared layout drag & drop</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 brand-gradient px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" /> AI Tasks
                </button>
                <div className="flex -space-x-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white ring-2 ring-surface">VK</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-bold text-white ring-2 ring-surface">AL</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white ring-2 ring-surface">RS</span>
                </div>
              </div>
            </div>

            {/* Kanban Columns Grid with Framer Motion LayoutGroup */}
            <LayoutGroup>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                {COLUMNS.map((col) => (
                  <div key={col.key} className="rounded-2xl border border-line/60 bg-surface-2/40 p-3.5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                        <span className="text-xs font-bold text-ink">{col.title}</span>
                      </div>
                      <motion.span
                        key={`count-${col.key}-${board[col.key].length}`}
                        initial={{ scale: 1.3, color: col.color }}
                        animate={{ scale: 1, color: "var(--color-faint)" }}
                        transition={{ duration: 0.2 }}
                        className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-bold"
                      >
                        {board[col.key].length}
                      </motion.span>
                    </div>

                    <div className="space-y-3 min-h-[220px]">
                      {board[col.key].map((id) => {
                        const card = CARDS[id];
                        const isMoving = id === movingId;
                        return (
                          <motion.div
                            layout
                            layoutId={`hero-card-${id}`}
                            key={id}
                            transition={spring}
                          >
                            <motion.div
                              animate={
                                isMoving
                                  ? { scale: 1.06, rotate: -3 }
                                  : { scale: 1, rotate: 0 }
                              }
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className={`group relative rounded-xl border p-3.5 transition-all duration-200 ${
                                isMoving
                                  ? "relative z-30 border-brand-500 bg-surface shadow-[0_20px_40px_rgba(99,102,241,0.4)] ring-2 ring-brand-500/40"
                                  : col.key === "Done"
                                  ? "border-line/70 bg-surface opacity-75"
                                  : "border-line/70 bg-surface hover:border-brand-500/30"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${card.priorityBg}`}>
                                  {card.priority}
                                </span>
                                <span className="text-[10px] font-mono text-faint">{card.subtasks}</span>
                              </div>
                              <p className={`mt-2 text-xs font-semibold text-ink ${col.key === "Done" ? "line-through decoration-muted" : ""}`}>
                                {card.title}
                              </p>
                              <div className="mt-3 flex items-center justify-between border-t border-line/40 pt-2 text-[10px] text-faint">
                                <span className="flex items-center gap-1">
                                  {col.key === "Done" ? (
                                    <span className="flex items-center gap-1 text-emerald-400">
                                      <CheckCircle2 className="h-3 w-3" /> Completed
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-muted" /> Active
                                    </span>
                                  )}
                                </span>
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/20 text-[9px] font-bold text-brand-300">
                                  {card.assignee}
                                </span>
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </LayoutGroup>
          </div>

          {/* Floating Live Activity Toast */}
          <AnimatePresence>
            {movingId && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-2xl border border-brand-500/40 bg-surface/95 px-5 py-2.5 shadow-2xl backdrop-blur-xl flex items-center gap-2 text-xs font-semibold text-ink"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Moving <b>"{lastMovedTitle}"</b> to next column...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
