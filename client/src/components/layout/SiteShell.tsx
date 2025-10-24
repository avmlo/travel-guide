import { ReactNode } from "react";

import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { cn } from "@/lib/utils";

type SiteShellProps = {
  children: ReactNode;
  hero?: ReactNode;
  mainClassName?: string;
};

export function SiteShell({ children, hero, mainClassName }: SiteShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f5f1] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 mix-blend-multiply dark:opacity-40">
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent dark:via-slate-700/40" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 160 160\'%3E%3Cg fill=\'none\' stroke=\'%23b8c1ba\' stroke-width=\'0.5\' opacity=\'0.35\'%3E%3Cpath d=\'M0 .25h160M0 80.25h160M0 160.25h160\'/%3E%3Cpath d=\'M.25 0v160M80.25 0v160M160.25 0v160\'/%3E%3C/g%3E%3C/svg%3E')] bg-[length:160px_160px]" />
      </div>
      <Header />
      <main className={cn("relative z-10 flex min-h-[calc(100vh-220px)] flex-col", mainClassName)}>
        {hero && <div className="relative">{hero}</div>}
        <div className="flex-1 pb-24">{children}</div>
      </main>
      <SimpleFooter />
    </div>
  );
}
