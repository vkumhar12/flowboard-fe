import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  isValidElement,
  type ChangeEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { cn } from "../../lib/utils";

const labelCls = "block text-xs font-medium tracking-tight text-muted";

// Radix `<Select.Item>` rejects an empty-string value (it's reserved
// internally to mean "no selection"), but this app's call sites rely on
// value="" to mean "Unassigned" / "All priorities" / etc. This sentinel
// round-trips "" through Radix without changing any call site's behavior.
const EMPTY_SENTINEL = "__empty__";
const toRadixValue = (v: string) => (v === "" ? EMPTY_SENTINEL : v);
const fromRadixValue = (v: string) => (v === EMPTY_SENTINEL ? "" : v);

interface OptionLike {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

// Adapts <option> children (the API every call site already uses) into
// Radix Select items, so this can swap in as a drop-in replacement for the
// native <select>-backed component it replaces.
const optionsFromChildren = (children: ReactNode): OptionLike[] =>
  Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    const props = child.props as { value?: string | number; children?: ReactNode; disabled?: boolean };
    return [{ value: String(props.value ?? ""), label: props.children, disabled: props.disabled }];
  });

interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  label?: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  children?: ReactNode;
}

const SelectMenu = ({
  value,
  onChange,
  children,
  disabled,
  id,
  triggerClassName,
}: Pick<SelectFieldProps, "value" | "onChange" | "children" | "disabled" | "id"> & {
  triggerClassName: string;
}) => {
  const options = optionsFromChildren(children);
  return (
    <SelectPrimitive.Root
      value={toRadixValue(String(value ?? ""))}
      disabled={disabled}
      onValueChange={(v) =>
        onChange?.({ target: { value: fromRadixValue(v) } } as ChangeEvent<HTMLSelectElement>)
      }
    >
      <SelectPrimitive.Trigger id={id} className={triggerClassName}>
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="pointer-events-none h-4 w-4 shrink-0 text-faint" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-72 overflow-hidden rounded-2xl border border-line bg-surface p-1 shadow-[var(--shadow-lift)] data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out"
        >
          <SelectPrimitive.Viewport>
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={toRadixValue(opt.value)}
                disabled={opt.disabled}
                className="relative flex cursor-pointer select-none items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-ink outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-surface-2"
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check className="h-3.5 w-3.5 text-brand-500" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

/** Form select — same look as Input, built on Radix Select instead of a native <select>. */
export const Select = ({ label, value, onChange, className, id, children, disabled }: SelectFieldProps) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
    )}
    <SelectMenu
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      triggerClassName={cn(
        "input-base flex w-full cursor-pointer items-center justify-between gap-2 rounded-full pr-4",
        className
      )}
    >
      {children}
    </SelectMenu>
  </div>
);

/** Compact pill select used in filter bars. */
export const FilterSelect = ({ className, value, onChange, children, disabled }: SelectFieldProps) => {
  const isActive = value !== undefined && value !== "";
  return (
    <SelectMenu
      value={value}
      onChange={onChange}
      disabled={disabled}
      triggerClassName={cn(
        "flex h-9 cursor-pointer items-center justify-between gap-2 rounded-full border pl-4 pr-3 text-xs font-semibold tracking-tight outline-none transition-all duration-200",
        isActive
          ? "border-brand-500/30 bg-brand-50/60 text-brand-700 shadow-[0_2px_8px_rgba(37,99,235,0.08)] hover:border-brand-500/50"
          : "border-line bg-surface text-ink shadow-[var(--shadow-card)] hover:border-brand-300 hover:shadow-[var(--shadow-soft)]",
        "focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15",
        className
      )}
    >
      {children}
    </SelectMenu>
  );
};

