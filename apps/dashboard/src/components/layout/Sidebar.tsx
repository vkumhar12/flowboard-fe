import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import type { ComponentType, ReactNode } from "react";
import {
  Plus, LayoutDashboard, Zap, CheckSquare, Calendar, Users, Settings,
  ChevronLeft, ChevronRight, HelpCircle, LogOut, Sparkles, MoreVertical, Pencil, Trash2, Star,
} from "lucide-react";
import { useBoards } from "../../context/BoardsContext";
import { useAuth } from "../../context/AuthContext";
import { Avatar, ConfirmDialog } from "@flowboard/shared";
import FavoriteStar from "../board/FavoriteStar";
import EditBoardModal from "../board/EditBoardModal";
import { cn, errorMessage } from "../../lib/utils";
import toast from "react-hot-toast";
import { type BoardListItem } from "@flowboard/shared";

// Section eyebrow (hidden when collapsed)
const SectionLabel = ({ children, collapsed }: { children: ReactNode; collapsed: boolean }) =>
  collapsed ? (
    <div className="mx-auto my-2 h-px w-6 bg-line" />
  ) : (
    <p className="px-4 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
      {children}
    </p>
  );

interface NavItemProps {
  to: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  collapsed: boolean;
  badge?: ReactNode;
}

// A nav row that adapts to collapsed/expanded
const NavItem = ({ to, icon: Icon, label, collapsed, badge }: NavItemProps) => (
  <NavLink
    to={to}
    title={collapsed ? label : undefined}
    className={({ isActive }) =>
      cn(
        "group relative flex h-11 items-center rounded-2xl text-sm font-medium transition-colors duration-200",
        collapsed ? "mx-auto w-11 justify-center" : "gap-3 px-3",
        isActive
          ? "bg-brand-50 font-semibold text-brand-700"
          : "text-muted hover:bg-surface-2 hover:text-ink"
      )
    }
  >
    {({ isActive }) => (
      <>
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
        )}
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
        {!collapsed && badge != null && (
          <span className="rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-bold tabular text-bg">
            {badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onCreateBoard: () => void;
  onCommand: () => void;
}

const Sidebar = ({ collapsed, onToggle, onCreateBoard, onCommand }: SidebarProps) => {
  const { boards, loading, remove: removeBoard, toggleFavorite } = useBoards();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<BoardListItem | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<BoardListItem | null>(null);
  const [activeBoardMenuId, setActiveBoardMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveBoardMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside
      className={cn(
        "fixed inset-y-3 left-3 z-40 hidden flex-col overflow-hidden rounded-3xl border border-line bg-surface/90 shadow-soft backdrop-blur-xl transition-[width] duration-300 ease-[var(--ease-spring)] md:flex",
        collapsed ? "w-[72px]" : "w-[252px]"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center gap-2.5 px-3.5">
        <div className="brand-gradient grid h-10 w-10 shrink-0 place-items-center rounded-2xl shadow-[var(--shadow-brand)]">
          <Zap className="h-5 w-5 fill-white text-white" />
        </div>
        {!collapsed && (
          <span className="flex-1 truncate font-display text-[17px] font-bold tracking-tight text-ink">
            Flowboard
          </span>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            title="Collapse sidebar"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center pb-1">
          <button
            onClick={onToggle}
            title="Expand sidebar"
            className="grid h-7 w-7 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Menu */}
      <SectionLabel collapsed={collapsed}>Menu</SectionLabel>
      <nav className="space-y-1 px-3">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
        <NavItem to="/my-tasks" icon={CheckSquare} label="My Tasks" collapsed={collapsed} />
        <NavItem to="/calendar" icon={Calendar} label="Calendar" collapsed={collapsed} />
        <NavItem to="/team" icon={Users} label="Team" collapsed={collapsed} />
      </nav>

      {/* Boards */}
      <div className={cn("mt-2 flex h-7 items-center", collapsed ? "justify-center" : "justify-between px-4")}>
        {!collapsed && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">Boards</span>
        )}
        <button
          onClick={onCreateBoard}
          title="New board"
          className="rounded-md p-1 text-faint transition-colors hover:bg-surface-2 hover:text-brand-600"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-1 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-3 pb-2 no-scrollbar">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn("flex h-10 items-center gap-3", collapsed ? "justify-center" : "px-1")}>
              <div className="skeleton h-7 w-7 shrink-0 rounded-lg" />
              {!collapsed && <div className="skeleton h-3 flex-1 rounded" />}
            </div>
          ))
        ) : boards.length === 0 ? (
          !collapsed && <p className="px-3 py-2 text-xs text-faint">No boards yet</p>
        ) : (
          boards.map((b) => {
            const color = b.color || "var(--color-brand-500)";
            const isMenuOpen = activeBoardMenuId === b.id;
            return (
              <div key={b.id} className={cn("group relative flex w-full min-w-0 items-center", isMenuOpen ? "z-50" : "z-0")}>
                <NavLink
                  to={`/board/${b.id}`}
                  title={b.title}
                  className={({ isActive }) =>
                    cn(
                      "flex h-10 w-full min-w-0 flex-1 items-center rounded-2xl text-sm transition-colors duration-200",
                      collapsed ? "mx-auto w-10 justify-center" : "gap-2.5 pl-2 pr-14",
                      isActive ? "bg-brand-50 font-medium text-brand-700" : "text-muted hover:bg-surface-2 hover:text-ink"
                    )
                  }
                >
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg font-display text-[12px] font-bold"
                    style={{ backgroundColor: `color-mix(in oklab, ${color} 13%, transparent)`, color }}
                  >
                    {b.title?.[0]?.toUpperCase() || "B"}
                  </span>
                  {!collapsed && <span className="min-w-0 flex-1 truncate">{b.title}</span>}
                </NavLink>

                {!collapsed && (
                  <>
                    {/* Task count (visible when not hovered & menu closed) */}
                    <span
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium tabular text-faint transition-opacity duration-150 pointer-events-none",
                        isMenuOpen ? "opacity-0" : "group-hover:opacity-0"
                      )}
                    >
                      {b.task_count}
                    </span>

                    {/* Action buttons (visible when hovered or menu open) */}
                    <div
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 transition-opacity duration-150",
                        isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                      )}
                    >
                      <FavoriteStar boardId={b.id} isFavorite={b.is_favorite} className="p-0.5" />

                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveBoardMenuId(isMenuOpen ? null : b.id);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface-2 hover:text-ink"
                          title="Board options"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>

                        {isMenuOpen && (
                          <div
                            ref={menuRef}
                            className="card animate-in absolute right-0 top-7 z-50 w-44 rounded-2xl p-1.5 shadow-[var(--shadow-lift)]"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <div className="mb-1 flex items-center gap-1.5 border-b border-line px-2.5 pb-1.5 pt-1 text-[11px] font-medium text-faint">
                              <CheckSquare className="h-3.5 w-3.5 text-brand-500" />
                              <span>{b.task_count} {Number(b.task_count) === 1 ? "task" : "tasks"}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveBoardMenuId(null);
                                setEditingBoard(b);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-ink hover:bg-surface-2"
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted" /> Edit board
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveBoardMenuId(null);
                                toggleFavorite(b.id);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-ink hover:bg-surface-2"
                            >
                              <Star
                                className={cn(
                                  "h-3.5 w-3.5",
                                  b.is_favorite ? "fill-amber-400 text-amber-400" : "text-muted"
                                )}
                              />
                              {b.is_favorite ? "Unfavorite" : "Favorite"}
                            </button>
                            {b.is_owner && (
                              <>
                                <div className="my-1 border-t border-line" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveBoardMenuId(null);
                                    setDeletingBoard(b);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-priority-urgent hover:bg-priority-urgent/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Delete board
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* General */}
      <SectionLabel collapsed={collapsed}>General</SectionLabel>
      <nav className="space-y-1 px-3">
        <button
          onClick={onCommand}
          title={collapsed ? "Search & shortcuts" : undefined}
          className={cn(
            "group flex h-11 w-full items-center rounded-2xl text-sm font-medium text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink",
            collapsed ? "mx-auto w-11 justify-center" : "gap-3 px-3"
          )}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="flex-1 truncate text-left">Help & search</span>}
        </button>
        <button
          onClick={() => { setIsLogoutConfirmOpen(true); }}
          title={collapsed ? "Log out" : undefined}
          className={cn(
            "group flex h-11 w-full items-center rounded-2xl text-sm font-medium text-muted transition-colors duration-200 hover:bg-priority-urgent/10 hover:text-priority-urgent",
            collapsed ? "mx-auto w-11 justify-center" : "gap-3 px-3"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="flex-1 truncate text-left">Log out</span>}
        </button>
      </nav>

      {/* Promo (expanded only) */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <button
            onClick={onCreateBoard}
            className="brand-gradient relative w-full overflow-hidden rounded-2xl p-4 text-left text-white shadow-[var(--shadow-brand)]"
          >
            <div className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-white/15 blur-xl" />
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="relative mt-3 font-display text-sm font-semibold tracking-tight">Plan with AI</p>
            <p className="relative mt-0.5 text-[11px] leading-relaxed text-white/80">
              Turn a goal into a backlog in seconds.
            </p>
          </button>
        </div>
      )}

      {/* User */}
      <div className="mx-3 mt-3 border-t border-line" />
      <NavLink 
        to="/settings"
        title={collapsed ? "Settings" : undefined}
        className={({ isActive }) => cn(
          "mx-2 mb-2 mt-2 flex items-center rounded-2xl transition-colors duration-200",
          collapsed ? "h-11 w-11 justify-center mx-auto" : "h-14 gap-3 px-3",
          isActive ? "bg-brand-50" : "hover:bg-surface-2"
        )}
      >
        <Avatar name={user?.name} id={user?.id} src={user?.avatar_url} size="sm" className="shrink-0" />
        {!collapsed && (
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-[13px] font-semibold text-ink">{user?.name}</p>
            <p className="truncate text-[11px] text-faint">{user?.email}</p>
          </div>
        )}
      </NavLink>

      <EditBoardModal
        open={Boolean(editingBoard)}
        onClose={() => setEditingBoard(null)}
        board={editingBoard}
      />

      <ConfirmDialog
        open={Boolean(deletingBoard)}
        onClose={() => setDeletingBoard(null)}
        onConfirm={async () => {
          if (!deletingBoard) return;
          const targetId = deletingBoard.id;
          setDeletingBoard(null);
          try {
            await removeBoard(targetId);
            toast.success("Board deleted");
            if (location.pathname === `/board/${targetId}`) {
              navigate("/dashboard");
            }
          } catch (err) {
            toast.error(errorMessage(err));
          }
        }}
        title="Delete board?"
        description={`Are you sure you want to permanently delete "${deletingBoard?.title}"?`}
        confirmLabel="Delete board"
        danger
      />

      <ConfirmDialog
        open={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          logout();
          navigate("/login");
        }}
        title="Log out?"
        description="Are you sure you want to log out of Flowboard?"
        confirmLabel="Log out"
        danger
      />
    </aside>
  );
};

export default Sidebar;
