import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, CheckSquare, Square } from "lucide-react";
import Avatar from "../ui/Avatar";
import { PriorityTag } from "../ui/Badge";
import { cn, formatDueDate } from "../../lib/utils";
import type { Task } from "../../types/task";

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  overlay?: boolean;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (taskId: string) => void;
}

const TaskCard = ({ task, onClick, overlay = false, selectionMode = false, selected = false, onToggleSelect }: TaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = { transform: CSS.Translate.toString(transform), transition };
  const due = formatDueDate(task.due_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && onClick?.(task)}
      className={cn(
        "group rounded-2xl border border-line bg-surface p-4",
        selectionMode ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        "shadow-[var(--shadow-card)] transition-shadow duration-200",
        "hover:shadow-[var(--shadow-soft)]",
        isDragging && "opacity-40",
        selected && "ring-2 ring-brand-500",
        overlay && "rotate-2 cursor-grabbing shadow-[var(--shadow-lift)]"
      )}
    >
      <div className="flex items-start gap-2">
        {selectionMode && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect?.(task.id);
            }}
            title={selected ? "Deselect task" : "Select task"}
            className={cn(
              "mt-0.5 shrink-0 rounded-full transition-colors",
              selected ? "text-brand-500" : "text-faint hover:text-brand-500"
            )}
          >
            {selected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          </button>
        )}
        <PriorityTag priority={task.priority} />
      </div>

      <p className="mt-2.5 text-[15px] font-semibold leading-snug tracking-tight text-ink">{task.title}</p>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">
          {task.description}
        </p>
      )}

      <div className="mt-3.5 flex items-center justify-between border-t border-line/70 pt-3">
        {task.assignee_id ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={task.assignee_name} id={task.assignee_id} src={task.assignee_avatar} size="xs" />
            <span className="max-w-[7rem] truncate text-[11px] text-muted">{task.assignee_name}</span>
          </div>
        ) : (
          <span className="text-[11px] text-faint">Unassigned</span>
        )}

        {due && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tabular",
              due.overdue ? "bg-priority-urgent/10 text-priority-urgent" : "bg-surface-2 text-muted"
            )}
          >
            <Calendar className="h-3 w-3" /> {due.label}
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(TaskCard);
