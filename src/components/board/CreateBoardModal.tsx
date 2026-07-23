import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { useBoards } from "../../context/BoardsContext";
import { cn, errorMessage } from "../../lib/utils";

// Vivid palette that complements the electric-blue theme.
const COLORS = [
  "#2563eb", // electric blue (brand default)
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#84cc16", // neon lime
  "#f59e0b", // amber
  "#f97316", // coral
  "#7c3aed", // violet
];

interface CreateBoardModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateBoardModal = ({ open, onClose }: CreateBoardModalProps) => {
  const { create } = useBoards();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", color: COLORS[0] });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const board = await create(form);
      toast.success("Board created");
      onClose();
      setForm({ title: "", description: "", color: COLORS[0] });
      navigate(`/board/${board.id}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create a board" description="Boards start with Todo, In Progress, Review and Done.">
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
          <Button type="submit" loading={loading}>Create board</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateBoardModal;
