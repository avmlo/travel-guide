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
    <footer className="relative border-t border-slate-300/70 bg-[#f6f5f1]/90 py-16 text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-5">
          <button
            onClick={() => handleNavigate("/")}
            className="text-left text-2xl font-semibold tracking-tight text-slate-900 transition hover:text-slate-600 dark:text-slate-100 dark:hover:text-emerald-200"
          >
            The Urban Manual
          </button>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Referencing the clean lines of <span className="font-semibold text-slate-900 dark:text-slate-100">urbanmanual.co</span>, this atlas curates design-forward places, itineraries, and AI guidance for your next city stay.
          </p>
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500/80 dark:text-slate-400/80">
            <span className="rounded-full border border-slate-300/70 px-3 py-1">Design driven</span>
            <span className="rounded-full border border-slate-300/70 px-3 py-1">City focussed</span>
            <span className="rounded-full border border-slate-300/70 px-3 py-1">AI assisted</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500/80 dark:text-slate-400/80">Explore</p>
          <ul className="mt-5 space-y-3 text-sm text-slate-500 dark:text-slate-400">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNavigate(link.href)}
                  className="transition hover:text-slate-900 dark:hover:text-white"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500/80 dark:text-slate-400/80">Community</p>
          <ul className="mt-5 space-y-3 text-sm text-slate-500 dark:text-slate-400">
            {communityLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNavigate(link.href)}
                  className="transition hover:text-slate-900 dark:hover:text-white"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500/80 dark:text-slate-400/80">Stay in touch</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monthly field notes, itineraries, and neighbourhood highlights—no spam, just cultivated context.
          </p>
          <form className="flex flex-col gap-3 text-sm">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder="Email address"
              className="w-full rounded-full border border-slate-300/70 bg-white/80 px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-400/30 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
            />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
            >
              Join the dispatch
            </button>
          </form>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            {policyLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNavigate(link.href)}
                  className="transition hover:text-slate-900 dark:hover:text-white"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 border-t border-slate-300/70 pt-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} The Urban Manual. Crafted with cues from urbanmanual.co.</p>
          <div className="flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500/80 dark:text-slate-400/80">
            <span>City guides</span>
            <span>Design hotels</span>
            <span>Neighbourhood rituals</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
