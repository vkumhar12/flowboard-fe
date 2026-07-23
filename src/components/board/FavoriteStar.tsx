import { Star } from "lucide-react";
import { useBoards } from "../../context/BoardsContext";
import { cn } from "../../lib/utils";

interface FavoriteStarProps {
  boardId: string;
  isFavorite: boolean;
  className?: string;
}

// Reused by both the Sidebar's board list and the Dashboard's board grid,
// both of which render this inside a <Link> — stopPropagation/preventDefault
// keep a click here from also navigating to the board.
const FavoriteStar = ({ boardId, isFavorite, className }: FavoriteStarProps) => {
  const { toggleFavorite } = useBoards();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(boardId);
      }}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "shrink-0 rounded-full p-1 transition-colors",
        isFavorite ? "text-priority-medium" : "text-faint hover:text-priority-medium",
        className
      )}
    >
      <Star className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
};

export default FavoriteStar;
