import { useState, useEffect, type ComponentType } from "react";
import toast from "react-hot-toast";
import { FileText, Loader2, CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { Modal } from "@flowboard/shared";
import { aiApi } from "@/services";
import { type AISummary } from "@flowboard/shared";

import { errorMessage } from "../../lib/utils";

interface SectionProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  items?: string[];
  color: string;
}

const Section = ({ icon: Icon, title, items, color }: SectionProps) => {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color }}>
        <Icon className="h-4 w-4" /> {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
};

interface AISummaryModalProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
}

const AISummaryModal = ({ open, onClose, boardId }: AISummaryModalProps) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<AISummary | null>(null);

  useEffect(() => {
    if (!open) return;
    setSummary(null);
    setLoading(true);
    aiApi
      .summary(boardId)
      .then(setSummary)
      .catch((err) => {
        toast.error(errorMessage(err));
        onClose();
      })
      .finally(() => setLoading(false));
  }, [open, boardId, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <span className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-500" /> AI Sprint Summary
        </span>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted">
          <Loader2 className="h-5 w-5 animate-spin text-brand-500" /> Analyzing board…
        </div>
      ) : summary ? (
        <div className="space-y-5">
          {summary.headline && (
            <p className="rounded-2xl border border-brand-500/15 bg-brand-50 p-4 text-sm leading-relaxed">
              {summary.headline}
            </p>
          )}
          <Section icon={CheckCircle2} title="Completed" items={summary.completed} color="var(--color-accent-emerald)" />
          <Section icon={Clock} title="In progress" items={summary.inProgress} color="var(--color-priority-medium)" />
          <Section icon={AlertTriangle} title="Risks & blockers" items={summary.risks} color="var(--color-priority-urgent)" />
          <Section icon={ArrowRight} title="Recommendations" items={summary.recommendations} color="var(--color-accent-violet)" />
        </div>
      ) : null}
    </Modal>
  );
};

export default AISummaryModal;
