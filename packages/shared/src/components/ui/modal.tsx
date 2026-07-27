import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";

type ModalSize = "sm" | "md" | "lg" | "xl";

const widths: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
};

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
}

/** App-level dialog, built on the Radix-based Dialog primitives in ./dialog. */
export const Modal = ({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) => (
  <Dialog open={open} onOpenChange={(next) => !next && onClose?.()}>
    <DialogContent className={cn(widths[size])}>
      {title || description ? (
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      ) : (
        <DialogTitle className="sr-only">Dialog</DialogTitle>
      )}
      {children}
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </DialogContent>
  </Dialog>
);

export default Modal;
