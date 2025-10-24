import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type HeroStat = {
  label: string;
  value: string;
  hint?: string;
};

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  media?: ReactNode;
  stats?: HeroStat[];
  className?: string;
  align?: "start" | "center";
  layout?: "split" | "stack";
};

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  media,
  stats,
  className,
  align = "start",
  layout = "split",
}: PageHeroProps) {
  const hasSplitLayout = layout === "split" && !!media;

  return (
    <section
      className={cn(
        "relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
        layout === "split" ? "py-16 sm:py-20" : "py-14 sm:py-16",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-12",
          hasSplitLayout && "lg:flex-row lg:items-start",
        )}
      >
        <div
          className={cn(
            "relative max-w-3xl space-y-6",
            align === "center" && "mx-auto text-center",
            hasSplitLayout && "lg:max-w-xl",
          )}
        >
          <div className="absolute -inset-x-6 -top-8 hidden h-px bg-gradient-to-r from-transparent via-slate-400/40 to-transparent dark:via-slate-700/60 sm:block" />
          {eyebrow && (
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
              <span className="h-px w-5 bg-slate-400/70" aria-hidden="true" />
              {eyebrow}
            </span>
          )}
          <h1 className="text-4xl font-medium leading-[1.1] tracking-tight text-slate-900 sm:text-[3.5rem] sm:leading-[1.05] dark:text-slate-50">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-lg leading-relaxed text-slate-700/80 dark:text-slate-300">
              {description}
            </p>
          )}
          {(actions || (stats && stats.length > 0)) && (
            <div className="flex flex-col gap-6">
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
              {stats && stats.length > 0 && (
                <dl className="grid gap-4 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-300/40 bg-white/60 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/70"
                    >
                      <dt className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </dt>
                      <dd className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                        {stat.value}
                      </dd>
                      {stat.hint && (
                        <p className="mt-2 text-xs text-slate-500/90 dark:text-slate-400/90">{stat.hint}</p>
                      )}
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
        </div>
        {media && (
          <div className="flex-1 lg:pl-12">
            <div className="relative overflow-hidden rounded-[32px] border border-slate-300/40 bg-white/70 p-1 shadow-[0_32px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/60">
              <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-950/50">
                {media}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
