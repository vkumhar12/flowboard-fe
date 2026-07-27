import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const labelCls = "block text-xs font-medium tracking-tight text-muted";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className={labelCls}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn("input-base rounded-full", error && "!border-priority-urgent", className)}
        {...props}
      />
      {error && <p className="text-xs text-priority-urgent">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, rows = 4, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className={labelCls}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={cn("input-base resize-none rounded-2xl", error && "!border-priority-urgent", className)}
        {...props}
      />
      {error && <p className="text-xs text-priority-urgent">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
