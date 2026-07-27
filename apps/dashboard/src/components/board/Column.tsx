import { useState, useRef, useEffect, memo, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, MoreHorizontal, Trash2, Sparkles, Pencil, CheckSquare, ArrowUpDown, ChevronLeft, Check } from "lucide-react";
import TaskCard from "./TaskCard";
import { ConfirmDialog } from "@flowboard/shared";
import { cn, columnAccent } from "../../lib/utils";
import { sortTasks, SORT_OPTIONS, type SortKey, type SortDirection } from "../../lib/taskSort";
import { type Column as ColumnType, type Task } from "@flowboard/shared";

// Stable reference used as the default for the optional selectedIds prop —
// a fresh `new Set()` in the default-parameter expression would be a new
// object every render, which would defeat this component's memo() below.
const EMPTY_SELECTION = new Set<string>();

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  index?: number;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
  onRename: (columnId: string, title: string) => void;
  onDelete: (columnId: string) => void;
  onAiGenerate: (columnId: string) => void;
  onSort: (columnId: string, orderedTaskIds: string[]) => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onEnterSelectionMode?: () => void;
  onToggleSelect?: (taskId: string) => void;
}

const sortPrefKey = (columnId: string) => `sort-pref-${columnId}`;

const readSortPref = (columnId: string): { key: SortKey; direction: SortDirection } | null => {
  try {
    const raw = localStorage.getItem(sortPrefKey(columnId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const Column = ({
  column, tasks, index = 0, onTaskClick, onAddTask, onRename, onDelete, onAiGenerate, onSort,
  selectionMode = false, selectedIds = EMPTY_SELECTION, onEnterSelectionMode = () => {}, onToggleSelect = () => {},
}: ColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: "column", column } });
  const accent = columnAccent(index);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<"main" | "sort">("main");
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [activeSort, setActiveSort] = useState(() => readSortPref(column.id));
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setTitle(column.title), [column.title]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setMenuView("main");
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    setMenuView("main");
  };

  const commitRename = () => {
    setEditing(false);
    const t = title.trim();
    if (t && t !== column.title) onRename(column.id, t);
    else setTitle(column.title);
  };

  const applySort = (key: SortKey, direction: SortDirection) => {
    const orderedIds = sortTasks(tasks, key, direction).map((t) => t.id);
    localStorage.setItem(sortPrefKey(column.id), JSON.stringify({ key, direction }));
    setActiveSort({ key, direction });
    closeMenu();
    onSort(column.id, orderedIds);
  };

  return (
    <div
      className={cn(
        "flex h-full w-[330px] shrink-0 flex-col rounded-2xl p-2.5 transition-colors",
        isOver && "ring-2 ring-inset"
      )}
      style={{
        backgroundColor: accent.soft,
        ...(isOver ? ({ "--tw-ring-color": accent.ring } as CSSProperties) : {}),
      }}
    >
      {/* Header */}
      <div className="mb-2 flex items-center gap-2 px-1.5 pt-1">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent.dot }} />
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => e.key === "Enter" && commitRename()}
            className="w-full rounded bg-surface px-2 py-0.5 text-sm font-semibold outline-none"
          />
        ) : (
          <h3 className="cursor-text font-display text-[15px] font-bold tracking-tight text-ink" onDoubleClick={() => setEditing(true)}>
            {column.title}
          </h3>
        )}
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold tabular text-muted shadow-[var(--shadow-card)]">
          {tasks.length}
        </span>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            onClick={() => onAddTask(column.id)}
            className="rounded-lg p-1.5 text-faint transition-colors hover:bg-surface hover:text-ink"
            title="Add task"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              title="Column options"
              className="rounded-lg p-1.5 text-faint transition-colors hover:bg-surface hover:text-ink"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="card animate-in absolute right-0 z-10 mt-1 w-48 rounded-2xl p-1.5 shadow-[var(--shadow-lift)]">
                {menuView === "main" ? (
                  <>
                    <MenuItem icon={Sparkles} onClick={() => { closeMenu(); onAiGenerate(column.id); }}>
                      Generate with AI
                    </MenuItem>
                    <MenuItem icon={Pencil} onClick={() => { closeMenu(); setEditing(true); }}>
                      Rename
                    </MenuItem>
                    <MenuItem icon={ArrowUpDown} onClick={() => setMenuView("sort")}>
                      Sort by
                    </MenuItem>
                    {!selectionMode && (
                      <MenuItem icon={CheckSquare} onClick={() => { closeMenu(); onEnterSelectionMode?.(); }}>
                        Select tasks
                      </MenuItem>
                    )}
                    <div className="my-1 border-t" />
                    <MenuItem icon={Trash2} danger onClick={() => { closeMenu(); setConfirmOpen(true); }}>
                      Delete column
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setMenuView("main")}
                      className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-faint transition-colors hover:bg-surface-2 hover:text-ink"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Sort by
                    </button>
                    <div className="my-1 border-t" />
                    <div className="max-h-64 overflow-y-auto">
                      {SORT_OPTIONS.map((opt) => {
                        const isActive = activeSort?.key === opt.key && activeSort?.direction === opt.direction;
                        return (
                          <button
                            key={`${opt.key}-${opt.direction}`}
                            onClick={() => applySort(opt.key, opt.direction)}
                            className={cn(
                              "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-surface-2",
                              isActive ? "font-medium text-brand-600" : "text-muted hover:text-ink"
                            )}
                          >
                            {opt.label}
                            {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-0.5 pb-1 no-scrollbar">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              selectionMode={selectionMode}
              selected={selectedIds?.has(task.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </SortableContext>

        <button
          onClick={() => onAddTask(column.id)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-line/80 bg-surface/40 py-2.5 text-xs font-medium text-faint transition-colors hover:border-ink/20 hover:bg-surface hover:text-muted"
        >
          <Plus className="h-3.5 w-3.5" /> Add task
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { onDelete(column.id); setConfirmOpen(false); }}
        title="Delete column?"
        description={`“${column.title}” and all its tasks will be permanently removed. This can’t be undone.`}
        confirmLabel="Delete column"
        danger
      />
    </div>
  );
};

interface MenuItemProps {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

const MenuItem = ({ icon: Icon, children, onClick, danger }: MenuItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-surface-2",
      danger ? "text-priority-urgent" : "text-muted hover:text-ink"
    )}
  >
    <Icon className="h-3.5 w-3.5" /> {children}
  </button>
);

export default memo(Column);
