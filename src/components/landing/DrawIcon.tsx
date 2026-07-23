import { useId, useRef } from "react";
import type { ComponentType, CSSProperties } from "react";
import { useInView } from "framer-motion";

interface DrawIconProps {
  icon: ComponentType<{ className?: string }>;
  className?: string;
  delay?: number;
  baseClassName?: string;
  traceColor?: string;
}

/**
 * Renders a lucide (outline) icon as two stacked layers:
 *  - a static, always-visible base stroke (baseClassName sets its color)
 *  - an animated stroke on top that continuously traces the path
 * The tracer defaults to the brand green gradient; pass `traceColor` for a
 * solid colour instead (e.g. on dark backgrounds).
 */
const DrawIcon = ({
  icon: Icon,
  className = "",
  delay = 0,
  baseClassName = "text-faint/60",
  traceColor,
}: DrawIconProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const gradId = useId().replace(/:/g, "");
  const stroke = traceColor ?? `url(#${gradId})`;

  return (
    <span
      ref={ref}
      className="relative inline-grid place-items-center"
      style={{ "--draw-delay": `${delay}s`, "--trace-stroke": stroke } as CSSProperties}
    >
      {/* brand-green gradient used by the tracer stroke */}
      {!traceColor && (
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="55%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* static base outline */}
      <Icon className={`${className} ${baseClassName}`} />

      {/* animated tracer on top */}
      <Icon className={`icon-draw absolute inset-0 ${className}${inView ? " is-drawing" : ""}`} />
    </span>
  );
};

export default DrawIcon;
