// Next's own ambient types only declare "*.module.css" (CSS Modules), not
// plain side-effect stylesheet imports like `import "./globals.css"` — add
// that here so `next build`'s type-check step doesn't reject it.
declare module "*.css";
