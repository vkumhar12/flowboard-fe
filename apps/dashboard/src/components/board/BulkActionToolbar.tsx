import { useState, useRef, useEffect } from "react";
import { ChevronDown, Trash2, X } from "lucide-react";
import { Button, ConfirmDialog, type Column } from "@flowboard/shared";

interface BulkActionToolbarProps {
  count: number;
  columns: Column[];
  onMove: (columnId: string) => void;
  onDelete: () => void;
  onCancel: () => void;
}

// Board-wide selection-mode toolbar — appears above the columns once any
// column's "Select tasks" menu item turns selection mode on (see
// KanbanBoard.tsx, which owns the selection state this reads/reports into).
const BulkActionToolbar = ({ count, columns, onMove, onDelete, onCancel }: BulkActionToolbarProps) => {
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) =>
      menuRef.current && !menuRef.current.contains(e.target as Node) && setMoveMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="mx-6 mb-4 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-[var(--shadow-card)]">
      <span className="text-sm font-medium text-ink">{count} selected</span>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative" ref={menuRef}>
          <Button size="sm" variant="outline" disabled={count === 0} onClick={() => setMoveMenuOpen((o) => !o)}>
            Move to <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          {moveMenuOpen && (
            <div className="card animate-in absolute right-0 z-30 mt-1 max-h-64 w-48 overflow-y-auto rounded-2xl p-1.5 shadow-[var(--shadow-lift)]">
              {columns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setMoveMenuOpen(false);
                    onMove(c.id);
                  }}
                  className="flex w-full items-center truncate rounded-lg px-2.5 py-1.5 text-left text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  {c.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button size="sm" variant="danger" disabled={count === 0} onClick={() => setDeleteConfirmOpen(true)}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>

        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="h-3.5 w-3.5" /> Cancel selection
        </Button>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          onDelete();
        }}
        title={`Delete ${count} task${count === 1 ? "" : "s"}?`}
        description="This can't be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
};

export default BulkActionToolbar;
