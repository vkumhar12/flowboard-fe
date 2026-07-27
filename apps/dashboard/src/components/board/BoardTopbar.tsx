import { Link } from "react-router-dom";
import { Sparkles, FileText, ChevronLeft, Zap, Command } from "lucide-react";
import { Button, AvatarStack } from "@flowboard/shared";
import { type Board, type PresenceUser } from "@flowboard/shared";
import FavoriteStar from "./FavoriteStar";

interface BoardTopbarProps {
  board: Board | null;
  isFavorite: boolean;
  presence: PresenceUser[];
  onQuickAdd: () => void;
  onAiTasks: () => void;
  onSummary: () => void;
}

// Board-specific replacement for the generic <Topbar> (used by every other
// page) — a board needs its own name/description front and center plus
// board-scoped actions, rather than the global search box + "New board"
// button every other page shows.
const BoardTopbar = ({ board, isFavorite, presence, onQuickAdd, onAiTasks, onSummary }: BoardTopbarProps) => {
  return (
    <header className="glass sticky top-0 z-20 flex min-h-[72px] items-center gap-4 border-b px-6 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <Link to="/dashboard" className="text-faint hover:text-ink md:hidden" title="Back to dashboard">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          {board ? (
            <>
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: board.color }} />
              <h1 className="truncate font-display text-lg font-bold leading-tight tracking-tight text-ink">
                {board.title}
              </h1>
              <FavoriteStar boardId={board.id} isFavorite={isFavorite} className="hover:bg-surface-2" />
            </>
          ) : (
            <h1 className="font-display text-lg font-bold text-ink">Loading…</h1>
          )}
        </div>
        {board?.description && <p className="mt-0.5 truncate pl-0.5 text-xs text-muted">{board.description}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        {presence.length > 0 && (
          <div className="mr-1 hidden items-center gap-2 sm:flex">
            <span className="text-[11px] font-medium text-faint">Viewing</span>
            <AvatarStack users={presence} size="xs" max={3} />
          </div>
        )}

        <button
          type="button"
          onClick={onQuickAdd}
          title="Quick add a task (⌘P)"
          className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-medium text-muted shadow-[var(--shadow-card)] transition-all duration-200 hover:border-brand-300 hover:text-ink hover:shadow-[var(--shadow-soft)] sm:flex"
        >
          <Zap className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Quick add</span>
          <kbd className="flex items-center gap-0.5 rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
            <Command className="h-3 w-3" />P
          </kbd>
        </button>

        <Button size="sm" onClick={onAiTasks} className="gap-1.5">
          <Sparkles className="h-4 w-4" /> <span className="hidden lg:inline">AI tasks</span>
        </Button>

        <Button size="sm" variant="outline" onClick={onSummary} className="gap-1.5">
          <FileText className="h-4 w-4" /> <span className="hidden lg:inline">Summary</span>
        </Button>
      </div>
    </header>
  );
};

export default BoardTopbar;
