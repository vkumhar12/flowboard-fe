import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Sparkles, FileText, Users, Activity, Search, ChevronLeft, Trash2, Pencil, MoreVertical, Star, Upload } from "lucide-react";
import { useBoard } from "../hooks/useBoard";
import { useLayout } from "../components/layout/AppLayout";
import { useBoards } from "../context/BoardsContext";
import FavoriteStar from "../components/board/FavoriteStar";
import ExportMenu from "../components/board/ExportMenu";
import ImportModal from "../components/board/ImportModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { aiApi } from "@/services";
import { PRIORITIES, errorMessage, cn } from "../lib/utils";
import { type Task, type TaskPriority } from "@flowboard/shared";

import Topbar from "../components/layout/Topbar";
import Button from "../components/ui/Button";
import { FilterSelect } from "../components/ui/Input";
import { AvatarStack } from "../components/ui/Avatar";
import { ColumnSkeleton } from "../components/ui/Skeleton";
import PromptDialog from "../components/ui/PromptDialog";
import KanbanBoard from "../components/board/KanbanBoard";
import TaskModal from "../components/board/TaskModal";
import MembersModal from "../components/board/MembersModal";
import EditBoardModal from "../components/board/EditBoardModal";
import AIGenerateModal from "../components/ai/AIGenerateModal";
import AISummaryModal from "../components/ai/AISummaryModal";
import ActivityFeed from "../components/ActivityFeed";

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
  const { openCreateBoard } = useLayout();
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

  if (!boardId) return null;

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

  const actions = (
    <div className="flex items-center gap-2">
      {b.presence.length > 0 && (
        <div className="mr-1.5 hidden items-center gap-2 sm:flex">
          <span className="text-[11px] font-medium text-faint">Viewing</span>
          <AvatarStack users={b.presence} size="xs" max={3} />
        </div>
      )}

      <Button size="sm" onClick={() => setAiGen({ open: true, columnId: b.columns[0]?.id ?? null })} className="gap-1.5">
        <Sparkles className="h-4 w-4" /> <span className="hidden lg:inline">AI tasks</span>
      </Button>

      <Button size="sm" variant="outline" onClick={() => setSummaryOpen(true)} className="gap-1.5">
        <FileText className="h-4 w-4" /> <span className="hidden lg:inline">Summary</span>
      </Button>

      {b.board && <ExportMenu board={b.board} columns={b.columns} tasks={b.tasks} />}

      <Button size="sm" variant="outline" onClick={() => setImportOpen(true)} className="gap-1.5">
        <Upload className="h-4 w-4" /> <span className="hidden lg:inline">Import</span>
      </Button>

      <div className="flex items-center rounded-2xl border border-line bg-surface p-0.5 shadow-[var(--shadow-card)]">
        <button
          type="button"
          onClick={() => setMembersOpen(true)}
          title="Board Members"
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Users className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setActivityOpen(true)}
          title="Activity Log"
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Activity className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Topbar
        title={
          <div className="flex items-center gap-2.5">
            <Link to="/dashboard" className="text-faint hover:text-ink md:hidden" title="Back to dashboard">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            {b.board ? (
              <div className="flex items-center gap-2.5">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: b.board.color }} />
                <span className="font-display text-lg font-bold tracking-tight text-ink">{b.board.title}</span>
                <FavoriteStar boardId={b.board.id} isFavorite={isFavorite} className="hover:bg-surface-2" />
              </div>
            ) : (
              "Loading…"
            )}
          </div>
        }
        subtitle={b.board?.description}
        actions={actions}
        onCreateBoard={openCreateBoard}
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2.5 px-6 py-3.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks"
            className="h-9 w-52 rounded-full border border-line bg-surface pl-9 pr-4 text-xs shadow-[var(--shadow-card)] outline-none transition-all duration-200 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15"
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
            className="rounded-full px-3 py-1.5 text-xs font-medium text-faint transition-colors hover:bg-surface-2 hover:text-ink"
          >
            Clear
          </button>
        )}
        <span className="ml-auto rounded-full bg-surface-2 px-3 py-1 text-xs font-medium tabular text-muted">
          {filteredTasks.length} tasks
        </span>
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
