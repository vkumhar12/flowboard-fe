import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, X, Calendar, User, Flag, Check, Sparkles, Info, Loader2 } from "lucide-react";
import { Avatar, PriorityTag, type BoardMember, Popover, PopoverTrigger, PopoverContent } from "@flowboard/shared";
import { parseQuickAddInput } from "../../lib/quickAddParser";

interface QuickAddBarProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (raw: string) => Promise<void> | void;
  members: BoardMember[];
}

const QuickAddBar = ({ open, onClose, onSubmit, members }: QuickAddBarProps) => {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const submit = async () => {
    const raw = value.trim();
    if (!raw || submitting) return;
    setError(false);
    setSubmitting(true);
    try {
      await onSubmit(raw);
      onClose();
    } catch {
      setError(true);
      // Auto-clear the error shake after 600ms
      setTimeout(() => setError(false), 600);
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // Parse details in real-time
  const parsed = parseQuickAddInput(value, members);
  const assignee = members.find((m) => m.id === parsed.assignee_id);
  const hasText = value.trim().length > 0;

  // Check if each token is active
  const hasAssignee = !!parsed.assignee_id;
  const hasPriority = !!parsed.priority;
  const hasDueDate = !!parsed.due_date;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="fixed inset-0 bg-ink/35 backdrop-blur-[4px]" onClick={onClose} />
          <motion.div
            className="card relative z-10 w-full max-w-xl overflow-hidden rounded-[24px] border border-line bg-surface/95 shadow-[0_32px_64px_-12px_rgba(99,102,241,0.16)] backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-line/60 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                  <Zap className="h-4 w-4 fill-brand-500/10" />
                </span>
                <span className="font-display text-sm font-bold tracking-tight text-ink">Quick Add Task</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-6 w-6 items-center justify-center rounded-full text-faint transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Input Wrapper */}
            <div className="relative border-b border-line/60 bg-surface-2/40 px-5 py-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4.5 w-4.5 text-brand-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={submitting}
                  placeholder="Fix Stripe webhook bug by tomorrow @vikash P1"
                  className="h-10 w-full bg-transparent font-medium text-ink placeholder:text-faint outline-none text-base border-0 focus:ring-0 p-0"
                />
              </div>
            </div>

            {/* Live Preview Card Section */}
            <div className="p-5 border-b border-line/60 bg-surface/50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-faint mb-3">Live Task Preview</p>
              
              <div className="rounded-2xl border border-line bg-surface-2/40 p-4 shadow-sm relative overflow-hidden transition-all duration-200 hover:border-brand-500/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2.5 flex-1 min-w-0">
                    {/* Priority Indicator */}
                    <div className="flex items-center gap-2">
                      {parsed.priority ? (
                        <PriorityTag priority={parsed.priority} />
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-surface-3 px-2 py-0.5 text-[9px] font-semibold text-faint tracking-wider uppercase border border-line/40">
                          P4 (Default)
                        </span>
                      )}
                    </div>

                    {/* Task Title */}
                    <h4 className={`text-sm font-semibold leading-snug tracking-tight truncate ${parsed.title.trim() ? 'text-ink' : 'text-faint italic'}`}>
                      {parsed.title.trim() ? parsed.title : "Untitled Task"}
                    </h4>
                  </div>
                  
                  {/* Assignee Avatar */}
                  <div className="shrink-0">
                    <Avatar 
                      name={assignee?.name} 
                      id={assignee?.id} 
                      src={assignee?.avatar_url} 
                      size="sm" 
                    />
                  </div>
                </div>

                {/* Footer Badges inside preview */}
                <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-[11px] text-muted">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-faint" />
                    <span>
                      {parsed.due_date ? (
                        <span className="text-ink font-semibold">{parsed.due_date}</span>
                      ) : (
                        <span className="text-faint">No due date</span>
                      )}
                    </span>
                  </div>

                  <span className="text-[10px] text-faint font-medium">
                    {assignee ? (
                      <span className="text-ink font-semibold">@{assignee.name}</span>
                    ) : (
                      "No assignee"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Smart Syntax Helper Guide */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-surface-2/30 border-b border-line/60">
              <div className="flex flex-wrap items-center gap-2">
                {/* Assignee Helper */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    hasAssignee
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-surface-2 text-muted border-line/40"
                  }`}
                >
                  {hasAssignee ? <Check className="h-3.5 w-3.5 shrink-0" /> : <User className="h-3.5 w-3.5 text-faint shrink-0" />}
                  <span>@name</span>
                </span>

                {/* Priority Helper with Info Popover (click to open) */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        hasPriority
                          ? "bg-brand-500/10 text-brand-600 border-brand-500/20"
                          : "bg-surface-2 text-muted border-line/40"
                      }`}
                    >
                      {hasPriority ? <Check className="h-3.5 w-3.5 shrink-0" /> : <Flag className="h-3.5 w-3.5 text-faint shrink-0" />}
                      <span>P1–P4</span>
                      <Info className="h-3 w-3 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="center" className="z-[70] w-auto max-w-[220px] space-y-1.5 p-3 rounded-xl">
                    <p className="font-bold text-xs text-ink mb-2">Priority Levels</p>
                    <p className="text-[11px] text-muted"><span className="font-semibold text-red-400">P1</span> — Urgent (critical)</p>
                    <p className="text-[11px] text-muted"><span className="font-semibold text-orange-400">P2</span> — High priority</p>
                    <p className="text-[11px] text-muted"><span className="font-semibold text-yellow-400">P3</span> — Medium priority</p>
                    <p className="text-[11px] text-muted"><span className="font-semibold text-blue-400">P4</span> — Low priority</p>
                  </PopoverContent>
                </Popover>

                {/* Date Helper */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    hasDueDate
                      ? "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
                      : "bg-surface-2 text-muted border-line/40"
                  }`}
                >
                  {hasDueDate ? <Check className="h-3.5 w-3.5 shrink-0" /> : <Calendar className="h-3.5 w-3.5 text-faint shrink-0" />}
                  <span>by date</span>
                </span>
              </div>

              <span className="text-[10px] font-semibold text-faint tracking-tight self-end sm:self-center">
                Goes into the first column
              </span>
            </div>

            {/* Action Buttons Footer */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center h-9 px-4 rounded-xl text-[13px] font-semibold text-muted bg-surface hover:bg-surface-2 border border-line transition-all duration-150 active:scale-[0.97]"
              >
                Dismiss
                <kbd className="ml-2 hidden sm:inline-flex items-center rounded-md bg-surface-2 border border-line/60 px-1.5 py-0.5 text-[10px] font-mono text-faint">
                  Esc
                </kbd>
              </button>
              <motion.button
                type="button"
                onClick={submit}
                disabled={!hasText || submitting}
                animate={error ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                transition={error ? { duration: 0.4, ease: "easeInOut" } : {}}
                className={`inline-flex items-center justify-center h-9 px-5 rounded-xl text-[13px] font-semibold text-white transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none gap-2 ${
                  error
                    ? "bg-red-500 shadow-md shadow-red-500/25"
                    : "brand-gradient shadow-md shadow-brand-500/20 hover:brightness-[1.07]"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Creating…
                  </>
                ) : error ? (
                  "Failed — try again"
                ) : (
                  <>
                    Create Task
                    <kbd className="hidden sm:inline-flex items-center rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-mono">
                      ↵
                    </kbd>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default QuickAddBar;
