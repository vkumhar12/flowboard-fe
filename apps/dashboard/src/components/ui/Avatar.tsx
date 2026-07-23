import { cn } from "../../lib/utils";
import { initials, colorFromId } from "../../lib/utils";
import { type PresenceUser } from "@flowboard/shared";

type AvatarSize = "xs" | "sm" | "md" | "lg";

const sizeMap: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

interface AvatarProps {
  name?: string | null;
  id?: string | null;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
  title?: string;
}

const isValidAvatarUrl = (url?: string | null): boolean => {
  if (!url) return false;
  return /^(https?:\/\/|data:image\/)/i.test(url);
};

const Avatar = ({ name, id, src, size = "md", className, title }: AvatarProps) => (
  <div
    title={title || name || undefined}
    className={cn(
      "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ring-2 ring-surface",
      sizeMap[size],
      className
    )}
    style={{ backgroundColor: src && isValidAvatarUrl(src) ? undefined : colorFromId(id || name || "") }}
  >
    {src && isValidAvatarUrl(src) ? (
      <img src={src} alt={name || ""} loading="lazy" className="h-full w-full object-cover" />
    ) : (
      initials(name || "")
    )}
  </div>
);

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
        <Avatar key={u.id} id={u.id} name={u.name} src={"avatar_url" in u ? u.avatar_url : null} size={size} />
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
