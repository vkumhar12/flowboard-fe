import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import Column from "./Column";
import TaskCard from "./TaskCard";
import BulkActionToolbar from "./BulkActionToolbar";
import { nextPositionInColumn } from "../../lib/utils";
import type { Column as ColumnType } from "../../types/column";
import type { Task } from "../../types/task";
import type { useBoard } from "../../hooks/useBoard";

type BoardActions = ReturnType<typeof useBoard>;

// Compute a fractional position so a task lands at `index` within `siblings`
// (siblings must already exclude the task being moved, sorted by position).
const positionForIndex = (siblings: Task[], index: number): number => {
  const prev = index > 0 ? siblings[index - 1]?.position : null;
  const next = index < siblings.length ? siblings[index]?.position : null;
  if (prev == null && next == null) return 1000;
  if (prev == null) return next! / 2;
  if (next == null) return prev + 1000;
  return (prev + next) / 2;
};

interface KanbanBoardProps {
  columns: ColumnType[];
  tasks: Task[];
  actions: BoardActions;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
  onAiGenerate: (columnId: string) => void;
  onAddColumn: () => void;
}

const KanbanBoard = ({ columns, tasks, actions, onTaskClick, onAddTask, onAiGenerate, onAddColumn }: KanbanBoardProps) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const col of columns) map[col.id] = [];
    for (const t of tasks) (map[t.column_id] ||= []).push(t);
    for (const id in map) map[id].sort((a, b) => a.position - b.position);
    return map;
  }, [columns, tasks]);

  /* --------------------------- selection mode --------------------------- */

  const enterSelectionMode = () => setSelectionMode(true);

  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (taskId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const bulkMove = async (targetColumnId: string) => {
    const selectedTasks = tasks.filter((t) => selectedIds.has(t.id));
    // Positions are precomputed from one snapshot, not left to each moveTask
    // call to figure out — firing them in parallel from the same starting
    // point would otherwise land every task on the same position.
    const basePosition = nextPositionInColumn(tasksByColumn[targetColumnId] || []);
    await Promise.all(
      selectedTasks.map((t, i) => actions.moveTask(t.id, targetColumnId, basePosition + i * 1000))
    );
    cancelSelection();
  };

  const bulkDelete = async () => {
    await Promise.all([...selectedIds].map((id) => actions.deleteTask(id)));
    cancelSelection();
  };

  /* ------------------------------ column sort ------------------------------ */

  // A real, persisted reorder (same gap-of-1000 scheme as everywhere else) —
  // not just a local display preference, so it sticks the same way a manual
  // drag-and-drop reorder would, and every collaborator sees the new order.
  const applySort = (columnId: string, orderedTaskIds: string[]) => {
    const byId = new Map((tasksByColumn[columnId] || []).map((t) => [t.id, t]));
    orderedTaskIds.forEach((taskId, i) => {
      const newPosition = (i + 1) * 1000;
      if (byId.get(taskId)?.position !== newPosition) {
        actions.moveTask(taskId, columnId, newPosition);
      }
    });
  };

  /* ------------------------------ drag/drop ------------------------------ */

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveTask(tasks.find((t) => t.id === active.id) || null);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const activeTaskObj = tasks.find((t) => t.id === activeId);
    if (!activeTaskObj) return;

    // Resolve the target column from the drop target.
    const overData = over.data.current as { type?: string; task?: Task } | undefined;
    let targetColumnId: string;
    if (overData?.type === "column") targetColumnId = String(over.id);
    else if (overData?.type === "task") targetColumnId = overData.task!.column_id;
    else targetColumnId = activeTaskObj.column_id;

    const siblings = (tasksByColumn[targetColumnId] || []).filter((t) => t.id !== activeId);

    let index: number;
    if (overData?.type === "task") {
      const overIndex = siblings.findIndex((t) => t.id === over.id);
      index = overIndex === -1 ? siblings.length : overIndex;
    } else {
      index = siblings.length; // dropped on empty column area
    }

    const newPosition = positionForIndex(siblings, index);

    // No-op guard
    if (
      activeTaskObj.column_id === targetColumnId &&
      activeTaskObj.position === newPosition
    ) {
      return;
    }

    actions.moveTask(activeId, targetColumnId, newPosition);
  };

  return (
    <div className="flex h-full flex-col">
      {selectionMode && (
        <BulkActionToolbar
          count={selectedIds.size}
          columns={columns}
          onMove={bulkMove}
          onDelete={bulkDelete}
          onCancel={cancelSelection}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        <div className="flex h-full flex-1 gap-5 overflow-x-auto px-6 pb-6">
          {columns.map((col, i) => (
            <Column
              key={col.id}
              column={col}
              index={i}
              tasks={tasksByColumn[col.id] || []}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
              onAiGenerate={onAiGenerate}
              onRename={actions.renameColumn}
              onDelete={actions.deleteColumn}
              onSort={applySort}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onEnterSelectionMode={enterSelectionMode}
              onToggleSelect={toggleSelect}
            />
          ))}

          {/* Add column */}
          <button
            onClick={onAddColumn}
            className="flex h-11 w-[300px] shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line text-sm font-medium text-faint transition-colors hover:border-brand-500/50 hover:bg-surface hover:text-muted"
          >
            <Plus className="h-4 w-4" /> Add column
          </button>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-[314px]">
              <TaskCard task={activeTask} overlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
