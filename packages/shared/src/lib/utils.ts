import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names, resolving conflicting Tailwind utilities (e.g.
 * cn("px-2", condition && "px-4") keeps only "px-4") instead of leaving
 * both in the string like a plain join would. Standard shadcn/ui helper.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
