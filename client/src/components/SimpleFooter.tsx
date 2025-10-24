import { useLocation } from "wouter";

const exploreLinks = [
  { label: "Discover", href: "/" },
  { label: "Cities", href: "/cities" },
  { label: "Explore", href: "/explore" },
  { label: "Editorial", href: "/editorial" },
];

const communityLinks = [
  { label: "Saved", href: "/saved" },
  { label: "Lists", href: "/lists" },
  { label: "Feed", href: "/feed" },
  { label: "Account", href: "/account" },
];

const policyLinks = [
  { label: "Privacy", href: "/privacy" },
];

export function SimpleFooter() {
  const [, setLocation] = useLocation();

  const handleNavigate = (href: string) => {
    setLocation(href);
  };

  return (
    <footer className="relative border-t border-emerald-500/10 bg-white/80 py-16 text-slate-600 backdrop-blur dark:border-emerald-400/10 dark:bg-slate-950/80 dark:text-slate-300">
      <div className="absolute inset-x-0 top-[-120px] -z-10 h-[240px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.3),_transparent_70%)]" />
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <button
            onClick={() => handleNavigate("/")}
            className="text-left text-2xl font-semibold tracking-tight text-slate-900 transition hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-300"
          >
            The Urban Manual
          </button>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            A fluent travel companion that curates purposeful itineraries, local rituals, and cultural signals for every city you call home, even for a few days.
          </p>
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/70 dark:text-emerald-300/80">
            <span className="rounded-full border border-emerald-500/20 px-3 py-1">Design-driven</span>
            <span className="rounded-full border border-emerald-500/20 px-3 py-1">Human curated</span>
            <span className="rounded-full border border-emerald-500/20 px-3 py-1">AI amplified</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Explore</p>
          <ul className="mt-5 space-y-3 text-sm text-slate-500 dark:text-slate-400">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNavigate(link.href)}
                  className="transition hover:text-emerald-600 dark:hover:text-emerald-300"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Community</p>
          <ul className="mt-5 space-y-3 text-sm text-slate-500 dark:text-slate-400">
            {communityLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNavigate(link.href)}
                  className="transition hover:text-emerald-600 dark:hover:text-emerald-300"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Stay in the loop</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Seasonal itineraries, modern design spots, and cultural briefings—no spam, just signal.
          </p>
          <form className="flex flex-col gap-3 text-sm">
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-full border border-emerald-500/20 bg-white/70 px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-400/20 dark:bg-slate-900/70 dark:text-slate-100"
            />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-emerald-700"
            >
              Join the dispatch
            </button>
          </form>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            {policyLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNavigate(link.href)}
                  className="transition hover:text-emerald-600 dark:hover:text-emerald-300"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 border-t border-emerald-500/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} The Urban Manual. All rights reserved.</p>
          <div className="flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600/70 dark:text-emerald-300/80">
            <span>Crafted for explorers</span>
            <span>Made in community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
