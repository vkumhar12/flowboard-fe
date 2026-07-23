// The marketing/landing page now lives in the separate apps/landing app
// (a different origin/port), so the brand logo on auth pages has to link
// out with a full URL instead of an in-app react-router <Link>.
export const LANDING_URL = import.meta.env.VITE_LANDING_URL || "http://localhost:3000";
