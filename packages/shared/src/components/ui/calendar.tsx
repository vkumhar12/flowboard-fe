import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";

export type CalendarProps = DayPickerProps;

export const Calendar = ({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) => (
  <DayPicker
    showOutsideDays={showOutsideDays}
    className={cn("p-3", className)}
    classNames={{
      months: "flex flex-col sm:flex-row gap-4",
      month: "space-y-4",
      month_caption: "flex justify-center pt-1 relative items-center text-sm font-medium text-ink",
      nav: "flex items-center justify-between absolute inset-x-1 top-1",
      button_previous: cn(
        buttonVariants({ variant: "outline", size: "iconSm" }),
        "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100"
      ),
      button_next: cn(
        buttonVariants({ variant: "outline", size: "iconSm" }),
        "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100"
      ),
      month_grid: "w-full border-collapse space-y-1",
      weekdays: "flex",
      weekday: "text-faint w-9 font-normal text-xs",
      week: "flex w-full mt-2",
      day: "h-9 w-9 text-center text-sm p-0 relative",
      day_button: cn(
        buttonVariants({ variant: "ghost" }),
        "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full"
      ),
      selected: "[&>button]:bg-brand-500 [&>button]:text-white [&>button]:hover:bg-brand-500 [&>button]:hover:text-white",
      today: "[&>button]:bg-surface-2 [&>button]:text-ink",
      outside: "text-faint opacity-50",
      disabled: "text-faint opacity-40",
      range_middle: "aria-selected:bg-surface-2 aria-selected:text-ink",
      hidden: "invisible",
      ...classNames,
    }}
    components={{
      Chevron: ({ orientation }) =>
        orientation === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
    }}
    {...props}
  />
);
Calendar.displayName = "Calendar";
