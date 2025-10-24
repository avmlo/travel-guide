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
      setIsScrolled(window.scrollY > 12);
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
      return "Global";
    }
    return "Worldwide";
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
    "sticky top-0 z-40 border-b border-emerald-500/10 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-emerald-400/10 dark:bg-slate-950/70",
    isScrolled ? "shadow-sm" : "shadow-none",
  );

  return (
    <header className={headerClass}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 transition-all sm:px-6 lg:px-8">
        <button
          onClick={() => handleNavigate("/")}
          className="group flex items-center gap-2 text-left text-2xl font-semibold tracking-tight text-slate-900 transition hover:text-emerald-700 dark:text-slate-100 dark:hover:text-emerald-300"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 transition group-hover:bg-emerald-500/20 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
            <Compass className="h-4 w-4" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600/80 dark:text-emerald-300/80">
              The Urban Manual
            </span>
            <span className="text-[11px] uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
              Curated Travels
            </span>
          </div>
        </button>

        <nav className="hidden items-center gap-6 rounded-full border border-emerald-500/10 bg-white/70 px-6 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur dark:border-emerald-400/15 dark:bg-slate-900/70 dark:text-slate-200 lg:flex">
          {primaryNav.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavigate(link.href)}
              className="transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:hover:text-emerald-300"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-3 rounded-full border border-emerald-500/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 backdrop-blur dark:border-emerald-400/10 dark:bg-slate-900/60 dark:text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-300" />
            <span>{locationHint}</span>
            <span className="mx-2 inline-block h-4 w-px bg-emerald-500/20" />
            <Clock3 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-300" />
            <span>{currentTime}</span>
          </div>
          <DarkModeToggle />
          {user && <NotificationDropdown />}
          <button
            onClick={() => handleNavigate("/account")}
            className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700 transition hover:bg-emerald-500/20 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200 dark:hover:bg-emerald-400/20 lg:flex"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Plan a trip
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <DarkModeToggle />
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/20 bg-white/70 text-slate-700 transition hover:bg-emerald-500/10 dark:border-emerald-400/20 dark:bg-slate-900/70 dark:text-slate-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="hidden border-t border-emerald-500/10 bg-white/60 py-3 dark:border-emerald-400/10 dark:bg-slate-950/60 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 text-sm font-medium text-slate-500 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-600/70 dark:text-emerald-300/80">
            <Sparkles className="h-4 w-4" />
            Your personal travel studio
          </div>
          <div className="flex items-center gap-4">
            {secondaryNav
              .filter((link) => (link.requireAuth ? !!user : true))
              .map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavigate(link.href)}
                  className="text-xs uppercase tracking-[0.3em] text-slate-500 transition hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-300"
                >
                  {link.label}
                </button>
              ))}
            {user ? (
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 transition hover:text-emerald-600 dark:border-emerald-400/20 dark:text-slate-300 dark:hover:text-emerald-300"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            ) : (
              <button
                onClick={() => handleNavigate("/account")}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 transition hover:text-emerald-600 dark:border-emerald-400/20 dark:text-slate-300 dark:hover:text-emerald-300"
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
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto border-l border-emerald-500/10 bg-white px-6 py-8 shadow-xl dark:border-emerald-400/10 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Navigate</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">The Urban Manual</p>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/20 bg-white/70 text-slate-700 transition hover:bg-emerald-500/10 dark:border-emerald-400/20 dark:bg-slate-900/70 dark:text-slate-200"
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
                    className="flex w-full items-center justify-between rounded-2xl border border-emerald-500/10 bg-white/90 px-4 py-4 text-left text-base font-semibold text-slate-700 transition hover:border-emerald-500/30 hover:text-emerald-600 dark:border-emerald-400/15 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-emerald-300"
                  >
                    {link.label}
                    <Compass className="h-4 w-4 text-emerald-500" />
                  </button>
                ))}
              </div>

              <div className="rounded-3xl border border-emerald-500/15 bg-emerald-500/10 p-5 text-sm text-slate-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-slate-100">
                <h3 className="text-base font-semibold text-emerald-700 dark:text-emerald-200">Plan with our AI studio</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Drop destinations into your itinerary, balance your days, and let our assistant suggest cultural highlights along the way.
                </p>
                <button
                  onClick={() => handleNavigate("/account")}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-700"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Launch planner
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-500">
                <p className="font-semibold uppercase tracking-[0.4em] text-emerald-600/80 dark:text-emerald-300/80">Profile</p>
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-between rounded-xl border border-emerald-500/10 bg-white/90 px-4 py-3 text-left font-semibold text-slate-700 transition hover:border-emerald-500/30 hover:text-emerald-600 dark:border-emerald-400/15 dark:bg-slate-900/60 dark:text-slate-100"
                  >
                    Sign out
                    <LogOut className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigate("/account")}
                    className="flex w-full items-center justify-between rounded-xl border border-emerald-500/10 bg-white/90 px-4 py-3 text-left font-semibold text-slate-700 transition hover:border-emerald-500/30 hover:text-emerald-600 dark:border-emerald-400/15 dark:bg-slate-900/60 dark:text-slate-100"
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
