import { useState, useEffect, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Upload, FileText, Kanban } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Select } from "../ui/Input";
import { errorMessage } from "../../lib/utils";
import {
  parseCsvSource,
  parseTrelloSource,
  guessFieldMapping,
  normalizeImportDate,
  normalizeImportPriority,
  type ParsedImportSource,
  type ImportField,
} from "../../lib/importParsers";
import type { Column } from "../../types/column";
import type { useBoard } from "../../hooks/useBoard";

type BoardActions = ReturnType<typeof useBoard>;

type Step = "upload" | "mapping" | "done";
type SourceType = "csv" | "trello";

type FieldMapping = Record<ImportField, string | null>;

const EMPTY_MAPPING: FieldMapping = { title: null, description: null, status: null, priority: null, due_date: null };

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  columns: Column[];
  actions: BoardActions;
}

// Entirely client-side, same as ExportMenu — the file is parsed and mapped
// in the browser, then tasks/columns are created one at a time through the
// same actions.createTask/actions.addColumn the rest of the app already
// uses (the same pattern AI-generated tasks are inserted with).
const ImportModal = ({ open, onClose, columns, actions }: ImportModalProps) => {
  const [step, setStep] = useState<Step>("upload");
  const [sourceType, setSourceType] = useState<SourceType>("csv");
  const [parsed, setParsed] = useState<ParsedImportSource | null>(null);
  const [mapping, setMapping] = useState<FieldMapping>(EMPTY_MAPPING);
  const [defaultColumnId, setDefaultColumnId] = useState(columns[0]?.id || "");
  const [fileError, setFileError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  // This modal is mounted (just hidden) before the board's columns finish
  // loading, so the useState initializer above often captures an empty
  // string — catch it up once real columns arrive, and again if the
  // previously-picked default column no longer exists (e.g. deleted).
  useEffect(() => {
    if (columns.length > 0 && !columns.some((c) => c.id === defaultColumnId)) {
      setDefaultColumnId(columns[0].id);
    }
  }, [columns, defaultColumnId]);

  const reset = () => {
    setStep("upload");
    setParsed(null);
    setMapping(EMPTY_MAPPING);
    setFileError(null);
    setProgress(0);
  };

  const close = () => {
    onClose();
    reset();
  };

  const handleFile = async (file: File) => {
    setFileError(null);
    try {
      const text = await file.text();
      const result = sourceType === "trello" ? parseTrelloSource(text) : parseCsvSource(text);
      if (!result.rows.length) throw new Error("No rows found in this file");

      setParsed(result);
      setMapping(
        sourceType === "trello"
          ? { title: "Title", description: "Description", status: "Status", priority: null, due_date: "Due Date" }
          : guessFieldMapping(result.headers)
      );
      setStep("mapping");
    } catch (err) {
      setFileError(
        err instanceof SyntaxError
          ? "That doesn't look like valid Trello JSON."
          : errorMessage(err)
      );
    }
  };

  const runImport = async () => {
    if (!parsed || !mapping.title || !defaultColumnId) return;

    setImporting(true);
    setProgress(0);
    // Case-insensitive status/list value → column id, seeded with the
    // board's existing columns; new values get a new column created for
    // them (once per unique value) instead of everything landing on the
    // fallback column.
    const columnIdByName = new Map(columns.map((c) => [c.title.trim().toLowerCase(), c.id]));

    let created = 0;
    try {
      for (const row of parsed.rows) {
        const title = mapping.title ? row[mapping.title]?.trim() : "";
        if (!title) continue;

        let columnId = defaultColumnId;
        const statusValue = mapping.status ? row[mapping.status]?.trim() : "";
        if (statusValue) {
          const key = statusValue.toLowerCase();
          const existing = columnIdByName.get(key);
          if (existing) {
            columnId = existing;
          } else {
            const newColumn = await actions.addColumn(statusValue);
            columnIdByName.set(key, newColumn.id);
            columnId = newColumn.id;
          }
        }

        await actions.createTask({
          column_id: columnId,
          title,
          description: mapping.description ? row[mapping.description] || null : null,
          priority: mapping.priority ? normalizeImportPriority(row[mapping.priority]) : "medium",
          due_date: mapping.due_date ? normalizeImportDate(row[mapping.due_date]) : null,
        });
        created++;
        setProgress(created);
      }
      toast.success(`Imported ${created} task${created === 1 ? "" : "s"}`);
      close();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={importing ? undefined : close}
      title="Import tasks"
      description={
        step === "upload"
          ? "Bring tasks in from a CSV file, a Jira CSV export, or a Trello board export."
          : "Match the columns from your file to Flowboard's fields."
      }
      size="lg"
      footer={
        step === "mapping" ? (
          <>
            <Button variant="ghost" onClick={() => setStep("upload")} disabled={importing}>
              Back
            </Button>
            <Button
              onClick={runImport}
              loading={importing}
              disabled={!mapping.title || !defaultColumnId}
            >
              {importing ? `Importing… ${progress}/${parsed?.rows.length ?? 0}` : `Import ${parsed?.rows.length ?? 0} tasks`}
            </Button>
          </>
        ) : undefined
      }
    >
      {step === "upload" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSourceType("csv")}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition-colors ${
                sourceType === "csv" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line text-muted hover:bg-surface-2"
              }`}
            >
              <FileText className="h-5 w-5" />
              CSV / Jira export
            </button>
            <button
              type="button"
              onClick={() => setSourceType("trello")}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition-colors ${
                sourceType === "trello" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line text-muted hover:bg-surface-2"
              }`}
            >
              <Kanban className="h-5 w-5" />
              Trello export
            </button>
          </div>

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-10 text-sm text-muted transition-colors hover:border-brand-500/50 hover:bg-surface-2">
            <Upload className="h-5 w-5" />
            {sourceType === "csv" ? "Choose a .csv file" : "Choose Trello's exported .json file"}
            <input
              type="file"
              accept={sourceType === "csv" ? ".csv,text/csv" : ".json,application/json"}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </label>

          {sourceType === "csv" && (
            <p className="text-xs text-faint">
              Jira: use its CSV export (Filters → Export → CSV). Column names like "Summary" and "Status" are recognized
              automatically.
            </p>
          )}

          {fileError && <p className="text-sm text-priority-urgent">{fileError}</p>}
        </div>
      )}

      {step === "mapping" && parsed && (
        <div className="space-y-4">
          <p className="text-xs text-faint">{parsed.rows.length} rows found. Only rows with a title are imported.</p>

          <FieldRow label="Title" required>
            <HeaderSelect headers={parsed.headers} value={mapping.title} onChange={(v) => setMapping((m) => ({ ...m, title: v }))} />
          </FieldRow>
          <FieldRow label="Description">
            <HeaderSelect headers={parsed.headers} value={mapping.description} onChange={(v) => setMapping((m) => ({ ...m, description: v }))} />
          </FieldRow>
          <FieldRow label="Status" hint="Matched against existing column names; anything new becomes a new column.">
            <HeaderSelect headers={parsed.headers} value={mapping.status} onChange={(v) => setMapping((m) => ({ ...m, status: v }))} />
          </FieldRow>
          <FieldRow label="Priority" hint="Falls back to Medium if a value isn't recognized.">
            <HeaderSelect headers={parsed.headers} value={mapping.priority} onChange={(v) => setMapping((m) => ({ ...m, priority: v }))} />
          </FieldRow>
          <FieldRow label="Due date">
            <HeaderSelect headers={parsed.headers} value={mapping.due_date} onChange={(v) => setMapping((m) => ({ ...m, due_date: v }))} />
          </FieldRow>

          <FieldRow label="Default column" required hint="Used for rows with no status, or an unmapped status.">
            <Select value={defaultColumnId} onChange={(e) => setDefaultColumnId(e.target.value)}>
              {columns.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          </FieldRow>
        </div>
      )}
    </Modal>
  );
};

const HeaderSelect = ({
  headers, value, onChange,
}: {
  headers: string[];
  value: string | null;
  onChange: (value: string | null) => void;
}) => (
  <Select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
    <option value="">None</option>
    {headers.map((h) => (
      <option key={h} value={h}>{h}</option>
    ))}
  </Select>
);

const FieldRow = ({
  label, required, hint, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) => (
  <div className="grid grid-cols-[140px_1fr] items-start gap-3">
    <div className="pt-2">
      <p className="text-sm font-medium text-ink">
        {label} {required && <span className="text-priority-urgent">*</span>}
      </p>
      {hint && <p className="mt-0.5 text-xs text-faint">{hint}</p>}
    </div>
    {children}
  </div>
);

export default ImportModal;
