import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

// Variant/size names match Flowboard's pre-shadcn Button so every existing
// call site keeps working unchanged — only the implementation underneath
// (cva + Radix Slot for `asChild`) is now shadcn's.
export const buttonVariants = cva(
  "inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-semibold transition-all duration-200 ease-[var(--ease-spring)] focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "brand-gradient text-white shadow-[var(--shadow-brand)] hover:brightness-[1.07] hover:shadow-[0_14px_34px_rgba(29,78,216,0.45)]",
        secondary:
          "bg-surface hover:bg-surface-2 text-ink border border-line shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]",
        ghost: "hover:bg-surface-2 text-muted hover:text-ink",
        danger:
          "bg-priority-urgent text-white shadow-[0_8px_20px_rgba(244,63,94,0.28)] hover:brightness-[1.06]",
        outline:
          "border border-line bg-surface hover:border-brand-300 hover:bg-surface-2 text-ink shadow-[var(--shadow-card)]",
        soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
      },
      size: {
        sm: "h-8 px-3.5 text-xs gap-1.5",
        md: "h-10 px-5 text-sm gap-2",
        lg: "h-12 px-7 text-[15px] gap-2",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  /** Render as the single child element instead of a <button> (Radix Slot). */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant, size, loading = false, className, disabled, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && !asChild && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export default Button;
