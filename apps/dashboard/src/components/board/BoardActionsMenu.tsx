import { MoreVertical, Download, Upload, Users, Activity } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@flowboard/shared";
import { boardToCsv, boardToJson, downloadFile, slugify } from "../../lib/exportBoard";
import { type Board, type Column, type Task } from "@flowboard/shared";

interface BoardActionsMenuProps {
  board: Board | null;
  columns: Column[];
  tasks: Task[];
  onImport: () => void;
  onMembers: () => void;
  onActivity: () => void;
}

// Groups the board-level actions that don't need to be one-click-visible
// (export, import, members, activity) behind a single "⋯" trigger, keeping
// the filter row's opposite side uncluttered — these were previously four
// separate buttons in the page header.
const BoardActionsMenu = ({ board, columns, tasks, onImport, onMembers, onActivity }: BoardActionsMenuProps) => {
  const exportAs = (format: "csv" | "json") => {
    if (!board) return;
    const base = slugify(board.title) || "board";
    if (format === "csv") {
      downloadFile(`${base}.csv`, boardToCsv(columns, tasks), "text/csv;charset=utf-8;");
    } else {
      downloadFile(`${base}.json`, boardToJson(board, columns, tasks), "application/json");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="More board actions"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-muted shadow-[var(--shadow-card)] transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Download className="h-4 w-4" /> Export
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => exportAs("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAs("json")}>Export as JSON</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={onImport}>
          <Upload className="h-4 w-4" /> Import
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onMembers}>
          <Users className="h-4 w-4" /> Members
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onActivity}>
          <Activity className="h-4 w-4" /> Activity log
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BoardActionsMenu;
