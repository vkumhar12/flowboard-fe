export const initials = (name = ""): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

/**
 * Deterministic avatar background color from a string id.
 * Uses hardcoded vivid colors with high contrast against white text
 * so initials are always clearly visible.
 */
export const colorFromId = (id = ""): string => {
  const palette = [
    "#2563eb", // blue-600
    "#7c3aed", // violet-600
    "#db2777", // pink-600
    "#dc2626", // red-600
    "#ea580c", // orange-600
    "#0891b2", // cyan-600
    "#059669", // emerald-600
    "#4f46e5", // indigo-600
    "#9333ea", // purple-600
    "#0d9488", // teal-600
    "#c026d3", // fuchsia-600
    "#ca8a04", // yellow-600
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};
