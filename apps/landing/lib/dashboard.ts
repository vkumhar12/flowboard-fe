// The dashboard is a separate app (apps/dashboard) with its own origin, so
// links to it can't use Next.js's <Link> (which only understands routes
// within this app) — they need a full URL instead.
export const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:5173";

export const dashboardHref = (path: string): string => `${DASHBOARD_URL}${path}`;
