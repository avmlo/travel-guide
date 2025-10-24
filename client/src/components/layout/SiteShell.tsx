import { ReactNode } from "react";
type SiteShellBackground = "gradient" | "canvas" | "plain";

import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { cn } from "@/lib/utils";

const backgroundStyles: Record<SiteShellBackground, string> = {
  gradient:
    "relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_rgba(15,118,110,0))] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_rgba(17,24,39,0.8))]",
  canvas: "relative min-h-screen bg-slate-50/70 dark:bg-slate-950",
  plain: "relative min-h-screen bg-background",
};

type SiteShellProps = {
  children: ReactNode;
  hero?: ReactNode;
  background?: SiteShellBackground;
  mainClassName?: string;
};

export function SiteShell({
  children,
  hero,
  background = "gradient",
  mainClassName,
}: SiteShellProps) {
  return (
    <div className={backgroundStyles[background]}>
      <div className="absolute inset-x-0 top-[-12rem] -z-10 overflow-hidden blur-3xl">
        <div className="relative left-1/2 aspect-[1155/678] w-[72.1875rem] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_52%)]" />
      </div>
      <Header />
      <main className={cn("relative z-10 flex min-h-[calc(100vh-220px)] flex-col", mainClassName)}>
        {hero && <div className="relative">{hero}</div>}
        <div className="flex-1 pb-24">
          {children}
        </div>
      </main>
      <SimpleFooter />
    </div>
  );
}
