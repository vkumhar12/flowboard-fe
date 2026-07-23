import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";
import Button from "../ui/Button";
import { boardToCsv, boardToJson, downloadFile, slugify } from "../../lib/exportBoard";
import type { Board } from "../../types/board";
import type { Column } from "../../types/column";
import type { Task } from "../../types/task";

interface ExportMenuProps {
  board: Board;
  columns: Column[];
  tasks: Task[];
}

// Entirely client-side — everything it needs is already loaded on the board
// page, so there's no export endpoint on the backend for this to call.
const ExportMenu = ({ board, columns, tasks }: ExportMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const exportAs = (format: "csv" | "json") => {
    setOpen(false);
    const base = slugify(board.title) || "board";
    if (format === "csv") {
      downloadFile(`${base}.csv`, boardToCsv(columns, tasks), "text/csv;charset=utf-8;");
    } else {
      downloadFile(`${base}.json`, boardToJson(board, columns, tasks), "application/json");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)} className="gap-1.5">
        <Download className="h-4 w-4" /> <span className="hidden lg:inline">Export</span> <ChevronDown className="h-3.5 w-3.5" />
      </Button>
      {open && (
        <div className="card animate-in absolute right-0 z-30 mt-1 w-40 rounded-2xl p-1.5 shadow-[var(--shadow-lift)]">
          <button
            onClick={() => exportAs("csv")}
            className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            Export as CSV
          </button>
          <button
            onClick={() => exportAs("json")}
            className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            Export as JSON
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
