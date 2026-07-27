import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, Flag, Users, X } from "lucide-react";
import { useBoard } from "../hooks/useBoard";
import { useBoards } from "../context/BoardsContext";
import ImportModal from "../components/board/ImportModal";
import { aiApi } from "@/services";
import { PRIORITIES, errorMessage } from "../lib/utils";
import { type Task, type TaskPriority } from "@flowboard/shared";
import { Button, ConfirmDialog, FilterSelect, PromptDialog } from "@flowboard/shared";

import BoardTopbar from "../components/board/BoardTopbar";
import BoardActionsMenu from "../components/board/BoardActionsMenu";
import { ColumnSkeleton } from "../components/ui/Skeleton";
import KanbanBoard from "../components/board/KanbanBoard";
import TaskModal from "../components/board/TaskModal";
import MembersModal from "../components/board/MembersModal";
import EditBoardModal from "../components/board/EditBoardModal";
import AIGenerateModal from "../components/ai/AIGenerateModal";
import AISummaryModal from "../components/ai/AISummaryModal";
import ActivityFeed from "../components/ActivityFeed";
import QuickAddBar from "../components/board/QuickAddBar";
import { parseQuickAddInput } from "../lib/quickAddParser";

interface TaskModalState {
  open: boolean;
  task: Task | null;
  columnId: string | null;
}

interface AiGenState {
  open: boolean;
  columnId: string | null;
}

const BoardPage = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const b = useBoard(boardId);
  const { boards, remove: removeBoard, toggleFavorite } = useBoards();
  const navigate = useNavigate();

  const [taskModal, setTaskModal] = useState<TaskModalState>({ open: false, task: null, columnId: null });
  const [aiGen, setAiGen] = useState<AiGenState>({ open: false, columnId: null });
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const [filterPriority, setFilterPriority] = useState<TaskPriority | "">("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [search, setSearch] = useState("");

  const currentBoard = useMemo(
    () => boards.find((item) => item.id === boardId),
    [boards, boardId]
  );
  const isFavorite = currentBoard?.is_favorite ?? false;

  const filteredTasks = useMemo(() => {
    return b.tasks.filter((t) => {
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterAssignee && t.assignee_id !== filterAssignee) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !(t.description || "").toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [b.tasks, filterPriority, filterAssignee, search]);

  // Cmd/Ctrl+P is intentionally scoped to this page (not AppLayout, where the
  // Cmd+K palette lives) since quick-add needs this board's live columns,
  // members and createTask mutation, none of which AppLayout has.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setQuickAddOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!boardId) return null;

  // Errors (including the guards below) are left to propagate to
  // QuickAddBar's caller instead of being caught here, so the bar stays
  // open and keeps the typed text on failure — matching how TaskModal
  // only closes after a successful createTask (see useBoard.ts).
  const handleQuickAdd = async (raw: string) => {
    const firstColumn = b.columns[0];
    if (!firstColumn) {
      toast.error("Add a column before quick-adding a task");
      throw new Error("No column to add to");
    }
    const parsed = parseQuickAddInput(raw, b.members);
    if (!parsed.title.trim()) {
      toast.error("Title is required");
      throw new Error("Title is required");
    }
    // No try/catch here: b.createTask's own mutation already toasts on
    // failure (see useBoard.ts's createTaskMutation onError), so this just
    // lets a rejection propagate up to QuickAddBar instead of toasting twice.
    await b.createTask({
      column_id: firstColumn.id,
      title: parsed.title,
      due_date: parsed.due_date,
      assignee_id: parsed.assignee_id,
      ...(parsed.priority ? { priority: parsed.priority } : {}),
    });
    toast.success("Task added");
  };

  const handleBreakdown = async (task: Task) => {
    try {
      const subtasks = await aiApi.breakdown(boardId, { taskId: task.id });
      for (const s of subtasks) {
        await b.createTask({
          column_id: task.column_id,
          title: s.title,
          description: s.description,
          priority: s.priority,
        });
      }
      toast.success(`Added ${subtasks.length} subtasks`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const canManage = b.role === "owner" || b.role === "admin";

  if (b.error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-semibold">Couldn’t load this board</p>
        <p className="text-muted">{b.error}</p>
        <Link to="/dashboard"><Button variant="outline">Back to dashboard</Button></Link>
      </div>
    );
  }

  return (
    <>
      <BoardTopbar
        board={b.board}
        isFavorite={isFavorite}
        presence={b.presence}
        onQuickAdd={() => setQuickAddOpen(true)}
        onAiTasks={() => setAiGen({ open: true, columnId: b.columns[0]?.id ?? null })}
        onSummary={() => setSummaryOpen(true)}
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2.5 px-6 py-3.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="h-9 w-52 rounded-full border border-line bg-surface pl-9 pr-4 text-xs font-medium tracking-tight shadow-[var(--shadow-card)] outline-none transition-all duration-200 placeholder:text-faint focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15"
          />
        </div>
        <FilterSelect value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TaskPriority | "")}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </FilterSelect>
        <FilterSelect value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
          <option value="">All assignees</option>
          {b.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </FilterSelect>
        {(filterPriority || filterAssignee || search) && (
          <button
            onClick={() => { setFilterPriority(""); setFilterAssignee(""); setSearch(""); }}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all duration-150 hover:bg-red-100/80 active:scale-[0.97]"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
        <span className="ml-auto rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold tabular text-muted">
          {filteredTasks.length} tasks
        </span>
        <BoardActionsMenu
          board={b.board}
          columns={b.columns}
          tasks={b.tasks}
          onImport={() => setImportOpen(true)}
          onMembers={() => setMembersOpen(true)}
          onActivity={() => setActivityOpen(true)}
        />
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden pt-4">
        {b.loading ? (
          <div className="flex gap-4 px-6">
            {[0, 1, 2, 3].map((i) => <ColumnSkeleton key={i} />)}
          </div>
        ) : (
          <KanbanBoard
            columns={b.columns}
            tasks={filteredTasks}
            actions={b}
            onTaskClick={(task) => setTaskModal({ open: true, task, columnId: task.column_id })}
            onAddTask={(columnId) => setTaskModal({ open: true, task: null, columnId })}
            onAiGenerate={(columnId) => setAiGen({ open: true, columnId })}
            onAddColumn={() => setAddColumnOpen(true)}
          />
        )}
      </div>

      {/* Modals */}
      <TaskModal
        open={taskModal.open}
        onClose={() => setTaskModal({ open: false, task: null, columnId: null })}
        task={taskModal.task}
        defaultColumnId={taskModal.columnId}
        columns={b.columns}
        members={b.members}
        actions={b}
        onBreakdown={handleBreakdown}
      />
      <AIGenerateModal
        open={aiGen.open}
        onClose={() => setAiGen({ open: false, columnId: null })}
        boardId={boardId}
        columns={b.columns}
        defaultColumnId={aiGen.columnId}
        onCreated={(tasks) => tasks.forEach(b.upsertTask)}
      />
      <AISummaryModal open={summaryOpen} onClose={() => setSummaryOpen(false)} boardId={boardId} />
      <MembersModal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        boardId={boardId}
        members={b.members}
        setMembers={b.setMembers}
        canManage={canManage}
        ownerId={b.board?.owner_id}
      />
      <ActivityFeed open={activityOpen} onClose={() => setActivityOpen(false)} boardId={boardId} />
      <EditBoardModal open={editBoardOpen} onClose={() => setEditBoardOpen(false)} board={b.board} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} columns={b.columns} actions={b} />
      <QuickAddBar open={quickAddOpen} onClose={() => setQuickAddOpen(false)} onSubmit={handleQuickAdd} members={b.members} />
      <PromptDialog
        open={addColumnOpen}
        onClose={() => setAddColumnOpen(false)}
        title="Add column"
        description="Give your new column a name."
        label="Column name"
        placeholder="e.g. Backlog"
        submitLabel="Add column"
        onSubmit={(name) => {
          b.addColumn(name).catch(() => {});
          setAddColumnOpen(false);
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={async () => {
          setDeleteConfirmOpen(false);
          try {
            await removeBoard(boardId);
            toast.success("Board deleted successfully");
            navigate("/dashboard");
          } catch (err) {
            toast.error(errorMessage(err));
          }
        }}
        title="Delete board?"
        description={`Are you sure you want to permanently delete the board "${b.board?.title}"? All tasks and columns will be removed.`}
        confirmLabel="Delete board"
        danger
      />
    </>
  );
};

export default BoardPage;
