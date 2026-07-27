import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * shadcn's toast primitive. Not currently mounted anywhere — Flowboard's
 * dashboard already mounts react-hot-toast's <Toaster/> (see routes/router.tsx)
 * and every existing toast(...) call site uses that. This is available for
 * new code that wants it; migrating existing toasts is a separate task.
 */
export const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    className="toaster group"
    style={
      {
        "--normal-bg": "var(--color-surface)",
        "--normal-text": "var(--color-ink)",
        "--normal-border": "var(--color-line)",
      } as CSSProperties
    }
    {...props}
  />
);
