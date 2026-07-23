import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { useBoards } from "../../context/BoardsContext";
import { cn, errorMessage } from "../../lib/utils";
import type { Board } from "../../types/board";

// Same palette as CreateBoardModal, kept in sync manually since there's
// no shared constant for it yet.
const COLORS = [
  "#2563eb", // electric blue (brand default)
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#84cc16", // neon lime
  "#f59e0b", // amber
  "#f97316", // coral
  "#7c3aed", // violet
];

interface EditBoardModalProps {
  open: boolean;
  onClose: () => void;
  board: Board | null;
}

const EditBoardModal = ({ open, onClose, board }: EditBoardModalProps) => {
  const { update } = useBoards();
  const [form, setForm] = useState({ title: "", description: "", color: COLORS[0] });
  const [loading, setLoading] = useState(false);

  // Re-seed the form from the current board each time the modal opens.
  useEffect(() => {
    if (open && board) {
      setForm({ title: board.title, description: board.description || "", color: board.color || COLORS[0] });
    }
  }, [open, board]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!board || !form.title.trim()) return;
    setLoading(true);
    try {
      await update(board.id, form);
      toast.success("Board updated");
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit board" description="Update the board's name, description or color.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Board name"
          placeholder="Product Roadmap"
          autoFocus
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          label="Description (optional)"
          rows={3}
          placeholder="What is this board about?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-muted">Accent color</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className={cn(
                  "h-7 w-7 rounded-full transition-transform",
                  form.color === c ? "ring-2 ring-ink/70 ring-offset-2 ring-offset-surface" : "hover:scale-110"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save changes</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditBoardModal;
