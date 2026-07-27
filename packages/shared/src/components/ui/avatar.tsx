import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { cn } from "../../lib/utils";
import { initials, colorFromId } from "../../lib/avatar";
import { type PresenceUser } from "../../types/user";

type AvatarSize = "xs" | "sm" | "md" | "lg";

const sizeMap: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

const isValidAvatarUrl = (url?: string | null): boolean => {
  if (!url) return false;
  return /^(https?:\/\/|data:image\/)/i.test(url);
};

export const AvatarRoot = forwardRef<
  ElementRef<typeof AvatarPrimitive.Root>,
  ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
AvatarRoot.displayName = "AvatarRoot";

export const AvatarImage = AvatarPrimitive.Image;
export const AvatarFallback = AvatarPrimitive.Fallback;

interface AvatarProps {
  name?: string | null;
  id?: string | null;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
  title?: string;
}

/** Presence/member avatar — image if valid, otherwise initials on a deterministic color. */
export const Avatar = ({ name, id, src, size = "md", className, title }: AvatarProps) => {
  const showImage = src && isValidAvatarUrl(src);
  return (
    <AvatarRoot
      title={title || name || undefined}
      className={cn("font-semibold text-white", sizeMap[size], className)}
      style={{ backgroundColor: showImage ? undefined : colorFromId(id || name || "") }}
    >
      {showImage && <AvatarImage src={src ?? undefined} alt={name || ""} loading="lazy" className="h-full w-full object-cover" />}
      <AvatarFallback className="flex h-full w-full items-center justify-center" delayMs={showImage ? 400 : undefined}>
        {initials(name || "")}
      </AvatarFallback>
    </AvatarRoot>
  );
};

interface AvatarStackUser {
  id: string;
  name: string;
  avatar_url?: string | null;
}

interface AvatarStackProps {
  users?: (AvatarStackUser | PresenceUser)[];
  max?: number;
  size?: AvatarSize;
}

export const AvatarStack = ({ users = [], max = 4, size = "sm" }: AvatarStackProps) => {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((u) => (
        <Avatar key={u.id} id={u.id} name={u.name} src={"avatar_url" in u ? u.avatar_url : null} size={size} className="ring-2 ring-surface" />
      ))}
      {extra > 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-muted ring-2 ring-surface">
          +{extra}
        </div>
      )}
    </div>
  );
};

export default Avatar;
