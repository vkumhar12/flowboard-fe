import { Link } from "react-router-dom";
import { Zap, Heart } from "lucide-react";

const columns = [
  {
    heading: "Product",
    links: [
      ["Features", "#features"],
      ["Interactive Demo", "#demo"],
      ["FAQ", "#faq"],
    ],
  },
  {
    heading: "Account",
    links: [
      ["Log in", "/login"],
      ["Sign up free", "/register"],
      ["Dashboard", "/dashboard"],
    ],
  },
  {
    heading: "Legal",
    links: [
      ["Privacy Policy", "#"],
      ["Terms of Service", "#"],
    ],
  },
];

const isRoute = (href: string): boolean => href.startsWith("/");

const Footer = () => (
  <footer className="border-t border-line bg-surface-2/20">
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        {/* Brand Column */}
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 font-semibold">
            <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl shadow-[var(--shadow-brand)]">
              <Zap className="h-4.5 w-4.5 fill-white text-white" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">Flowboard</span>
          </Link>
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted">
            The smart task manager powered by AI. Transform high-level goals into structured Kanban backlogs in seconds.
          </p>

          {/* System Status Pill */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>

        {/* Link Columns */}
        {columns.map((col) => (
          <div key={col.heading}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-faint">{col.heading}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  {isRoute(href) ? (
                    <Link to={href} className="text-xs font-medium text-muted transition-colors hover:text-ink">
                      {label}
                    </Link>
                  ) : (
                    <a href={href} className="text-xs font-medium text-muted transition-colors hover:text-ink">
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line/60 pt-8 text-xs text-muted sm:flex-row">
        <span>© {new Date().getFullYear()} Flowboard Inc. All rights reserved.</span>
        <div className="flex items-center gap-1.5 text-faint">
          <span>Crafted with</span>
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
          <span>for high-velocity teams</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
