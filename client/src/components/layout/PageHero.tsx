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
          layout === "split" && media
            ? "lg:flex-row lg:items-center"
            : "",
        )}
      >
        <div
          className={cn(
            "max-w-3xl space-y-6",
            align === "center" && "mx-auto text-center",
            layout === "split" && media && "lg:max-w-xl",
          )}
        >
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {eyebrow}
            </span>
          )}
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-slate-700/80 dark:text-slate-300">
              {description}
            </p>
          )}
          {(actions || (stats && stats.length > 0)) && (
            <div className="flex flex-col gap-6">
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
              {stats && stats.length > 0 && (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/80"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </dt>
                      <dd className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                        {stat.value}
                      </dd>
                      {stat.hint && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stat.hint}</p>
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
            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-1 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
              <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-950/60">
                {media}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
