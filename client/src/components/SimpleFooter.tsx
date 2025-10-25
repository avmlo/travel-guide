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
    <footer className="mt-32 border-t border-neutral-200 bg-white text-[#0a0a0a]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-16 px-6 py-16 md:px-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl space-y-6">
          <p className="text-xs uppercase tracking-[0.32em] text-neutral-400">The Urban Manual</p>
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">Evenings, designed deliberately.</h2>
          <p className="text-sm text-neutral-600">
            We surface the quiet standouts: the bars, rooms, and tables that feel like a considered gesture. Join the nightly cadence and stay aligned with where the city is heading next.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setLocation("/editorial")}
              className="rounded-full bg-[#0a0a0a] px-5 py-3 text-white transition hover:bg-black"
            >
              Read the editorial
            </Button>
            <Button
              onClick={() => setLocation("/account")}
              variant="outline"
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-[#0a0a0a] transition hover:border-black/20 hover:bg-neutral-50"
            >
              Join the list
            </Button>
          </div>
        </div>

        <div className="grid w-full max-w-md gap-10 sm:grid-cols-2">
          {FOOTER_LINKS.map((section) => (
            <div key={section.title} className="space-y-4 text-sm text-neutral-500">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">{section.title}</p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="transition hover:text-[#0a0a0a]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <button
                        onClick={() => setLocation(link.href)}
                        className="transition hover:text-[#0a0a0a]"
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

      <div className="border-t border-neutral-200">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-6 py-8 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between md:px-10">
          <span>© {year} The Urban Manual. Curated for the evening hours.</span>
          <div className="flex flex-wrap items-center gap-4 uppercase tracking-[0.32em] text-neutral-400">
            <span>Nightly dispatch</span>
            <span className="text-[#0a0a0a]">New York · {time}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
