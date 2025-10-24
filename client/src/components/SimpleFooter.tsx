import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const FOOTER_LINKS = [
  {
    title: "Explore",
    links: [
      { label: "Catalogue", href: "/" },
      { label: "Cities", href: "/cities" },
      { label: "Evenings", href: "/explore" },
      { label: "Saved", href: "/saved" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Account", href: "/account" },
      { label: "Contact", href: "mailto:hello@urbanmanual.co", external: true },
      { label: "Instagram", href: "https://instagram.com", external: true },
    ],
  },
];

export function SimpleFooter() {
  const [, setLocation] = useLocation();
  const year = new Date().getFullYear();
  const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <footer className="relative mt-24 overflow-hidden rounded-t-[48px] border-t border-white/10 bg-[#05060f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(66,76,140,0.22),transparent_60%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-6 py-16 md:px-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl space-y-6">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">The Urban Manual</p>
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">Good evenings start with generous intel.</h2>
          <p className="text-sm text-white/60">
            Subscribe to the nightly briefing for seasonal openings, late reservations, and the addresses worth stepping out for.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setLocation("/editorial")}
              className="rounded-2xl bg-white text-slate-900 transition hover:bg-slate-100"
            >
              Read the editorial
            </Button>
            <Button
              onClick={() => setLocation("/account")}
              variant="outline"
              className="rounded-2xl border border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
            >
              Join the list
            </Button>
          </div>
        </div>

        <div className="grid w-full max-w-md gap-10 sm:grid-cols-2">
          {FOOTER_LINKS.map((section) => (
            <div key={section.title} className="space-y-4 text-sm text-white/60">
              <p className="text-xs uppercase tracking-[0.3em] text-white/35">{section.title}</p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <button
                        onClick={() => setLocation(link.href)}
                        className="transition hover:text-white"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 py-8 text-xs text-white/40 md:flex-row md:items-center md:justify-between md:px-10">
          <span>© {year} The Urban Manual. All nights reserved.</span>
          <div className="flex flex-wrap items-center gap-4 uppercase tracking-[0.3em]">
            <span>Nightly dispatch</span>
            <span className="text-white/60">New York · {time}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
