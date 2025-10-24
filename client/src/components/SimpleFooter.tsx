import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function SimpleFooter() {
  const [, setLocation] = useLocation();

  return (
    <footer className="relative mt-20 overflow-hidden bg-gradient-to-t from-[#03060a] via-[#05070c] to-transparent py-16 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(79,70,229,0.2),transparent_55%)]" />
      <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-[1440px] gap-12 px-6 md:px-10 lg:grid-cols-[1.5fr,1fr]">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">The Urban Manual</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Good evenings start with better intel.</h2>
            <p className="max-w-xl text-sm text-white/60">
              Stay in the loop as we publish new addresses, seasonal shortlists, and the occasional off-menu surprise.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setLocation("/editorial")}
              className="rounded-2xl bg-white text-slate-900 transition hover:bg-slate-100"
            >
              Read the editorial
            </Button>
            <Button
              onClick={() => setLocation("/account")}
              className="rounded-2xl border border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
              variant="outline"
            >
              Join the list
            </Button>
          </div>
        </div>

        <div className="grid gap-10 sm:grid-cols-2">
          <div className="space-y-3 text-sm text-white/60">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Navigation</p>
            <ul className="space-y-2">
              <li><button onClick={() => setLocation("/")} className="transition hover:text-white">Catalogue</button></li>
              <li><button onClick={() => setLocation("/cities")} className="transition hover:text-white">Cities</button></li>
              <li><button onClick={() => setLocation("/explore")} className="transition hover:text-white">Explore</button></li>
              <li><button onClick={() => setLocation("/saved")} className="transition hover:text-white">Saved</button></li>
            </ul>
          </div>

          <div className="space-y-3 text-sm text-white/60">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Support</p>
            <ul className="space-y-2">
              <li><button onClick={() => setLocation("/privacy")} className="transition hover:text-white">Privacy</button></li>
              <li><button onClick={() => setLocation("/account")} className="transition hover:text-white">Account</button></li>
              <li><a href="mailto:hello@urbanmanual.co" className="transition hover:text-white">Contact</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="transition hover:text-white">Instagram</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-16 flex w-full max-w-[1440px] flex-col gap-4 border-t border-white/10 px-6 pt-8 text-xs text-white/40 md:flex-row md:items-center md:justify-between md:px-10">
        <span>© {new Date().getFullYear()} The Urban Manual. All nights reserved.</span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="tracking-[0.3em] uppercase">Nightly dispatch</span>
          <span>New York · {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
        </div>
      </div>
    </footer>
  );
}

