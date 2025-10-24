import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Menu, X, Sparkles, Compass, MapPin, Clock3, LogOut, UserRound } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { DarkModeToggle } from "./DarkModeToggle";
import { NotificationDropdown } from "./NotificationDropdown";

type NavLink = {
  label: string;
  href: string;
  requireAuth?: boolean;
};

const primaryNav: NavLink[] = [
  { label: "Discover", href: "/" },
  { label: "Cities", href: "/cities" },
  { label: "Explore", href: "/explore" },
  { label: "Stories", href: "/editorial" },
  { label: "Lists", href: "/lists" },
];

const secondaryNav: NavLink[] = [
  { label: "Saved", href: "/saved", requireAuth: true },
  { label: "Feed", href: "/feed", requireAuth: true },
  { label: "Account", href: "/account" },
];

export function Header() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(() =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "shortGeneric",
    }).format(new Date()),
  );

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZoneName: "shortGeneric",
        }).format(new Date()),
      );
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const locationHint = useMemo(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return "Worldwide";
    }
    return "Global";
  }, []);

  const handleNavigate = (href: string) => {
    setLocation(href);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    handleNavigate("/");
  };

  const mobileLinks = useMemo(() => {
    return [
      ...primaryNav,
      ...secondaryNav,
      { label: "Privacy", href: "/privacy" },
    ].filter((link) => (link.requireAuth ? !!user : true));
  }, [user]);

  const headerClass = cn(
    "sticky top-0 z-40 border-b border-slate-300/60 bg-[#faf9f5]/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70",
    isScrolled ? "shadow-[0_12px_24px_rgba(15,23,42,0.08)]" : "shadow-none",
  );

  return (
    <header className={headerClass}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 transition-all sm:px-6 lg:px-8">
        <button
          onClick={() => handleNavigate("/")}
          className="group flex items-center gap-3 text-left text-2xl font-semibold tracking-tight text-slate-900 transition hover:text-slate-600 dark:text-slate-100 dark:hover:text-emerald-200"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white text-slate-900 transition group-hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <Compass className="h-4 w-4" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-500 dark:text-slate-400">
              Urban Manual
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">City intelligence</span>
          </div>
        </button>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-200 lg:flex">
          {primaryNav.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavigate(link.href)}
              className="group relative pb-1 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 dark:hover:text-white"
            >
              {link.label}
              <span
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-slate-900 transition-transform duration-200 group-hover:scale-x-100 dark:bg-white"
                aria-hidden="true"
              />
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <div className="hidden items-center gap-3 rounded-full border border-slate-300/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 lg:flex">
            <MapPin className="h-3.5 w-3.5" />
            <span>{locationHint}</span>
            <span className="mx-2 inline-block h-4 w-px bg-slate-300/70 dark:bg-slate-700" />
            <Clock3 className="h-3.5 w-3.5" />
            <span>{currentTime}</span>
          </div>
          <DarkModeToggle />
          {user && <NotificationDropdown />}
          <button
            onClick={() => handleNavigate("/account")}
            className="hidden items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:bg-slate-900 hover:text-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:flex"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Plan a trip
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <DarkModeToggle />
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white/80 text-slate-700 transition hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="hidden border-t border-slate-200/70 bg-white/80 py-3 dark:border-slate-800 dark:bg-slate-950/70 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 text-sm font-medium text-slate-500 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-500/80 dark:text-slate-400/80">
            <Sparkles className="h-4 w-4" />
            urbanmanual.co — travel for design people
          </div>
          <div className="flex items-center gap-4">
            {secondaryNav
              .filter((link) => (link.requireAuth ? !!user : true))
              .map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavigate(link.href)}
                  className="text-xs uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  {link.label}
                </button>
              ))}
            {user ? (
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 transition hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            ) : (
              <button
                onClick={() => handleNavigate("/account")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 transition hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                <UserRound className="h-3.5 w-3.5" />
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto border-l border-slate-200/60 bg-[#faf9f5] px-6 py-8 shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500/80 dark:text-slate-400/80">Navigate</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">The Urban Manual</p>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white/80 text-slate-700 transition hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-10 space-y-6">
              <div className="space-y-3">
                {mobileLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavigate(link.href)}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-300/60 bg-white/90 px-4 py-4 text-left text-base font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-white"
                  >
                    {link.label}
                    <Compass className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>

              <div className="rounded-3xl border border-slate-300/60 bg-white/80 p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Plan with our AI studio</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Assign saved places to each day of your trip and let the assistant surface matches sourced from urbanmanual.co.
                </p>
                <button
                  onClick={() => handleNavigate("/account")}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Launch planner
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
                <p className="font-semibold uppercase tracking-[0.35em]">Profile</p>
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-300/60 bg-white/90 px-4 py-3 text-left font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                  >
                    Sign out
                    <LogOut className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigate("/account")}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-300/60 bg-white/90 px-4 py-3 text-left font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                  >
                    Sign in
                    <UserRound className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
