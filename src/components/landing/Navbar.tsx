import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Sparkles } from "lucide-react";
import Button from "../ui/Button";

const navLinks = [
  ["Features", "#features"],
  ["Interactive Demo", "#demo"],
  ["FAQ", "#faq"],
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ease-spring ${
        scrolled ? "px-3 pt-3 sm:px-4" : "glass border-b border-line backdrop-blur-md"
      }`}
    >
      <div
        className={`mx-auto flex items-center justify-between transition-all duration-300 ease-spring ${
          scrolled
            ? "glass mt-2 max-w-5xl rounded-full border border-line px-5 py-2.5 shadow-[var(--shadow-soft)] backdrop-blur-xl"
            : "max-w-7xl px-6 py-4"
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5 font-semibold">
          <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl shadow-[var(--shadow-brand)]">
            <Zap className="h-4.5 w-4.5 fill-white text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-ink">Flowboard</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-4 py-2 text-xs font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-xs font-semibold">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <button className="flex items-center gap-1.5 brand-gradient px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:opacity-95 transition-all">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Get Started Free</span>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
