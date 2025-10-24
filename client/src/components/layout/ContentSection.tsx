import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContentSectionProps = {
  title?: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  id?: string;
  bleed?: boolean;
  tone?: "default" | "muted" | "contrast";
  className?: string;
};

const toneClasses: Record<NonNullable<ContentSectionProps["tone"]>, string> = {
  default: "bg-transparent",
  muted: "bg-white/70 backdrop-blur dark:bg-slate-900/40",
  contrast: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900",
};

export function ContentSection({
  title,
  eyebrow,
  description,
  actions,
  children,
  id,
  bleed,
  tone = "default",
  className,
}: ContentSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative",
        bleed ? "mx-auto w-full" : "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-3xl border border-transparent",
          tone === "default" ? "" : "border-slate-200/70 dark:border-slate-800/60",
          toneClasses[tone],
          bleed ? "px-4 py-12 sm:px-6 lg:px-10" : "py-12 sm:py-14",
        )}
      >
        {(eyebrow || title || description || actions) && (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3 sm:max-w-2xl">
              {eyebrow && (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/5 dark:text-emerald-200">
                  {eyebrow}
                </span>
              )}
              {title && (
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-base text-slate-600 dark:text-slate-300">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </div>
        )}
        <div className={cn("mt-8", bleed && "mx-auto max-w-6xl")}>{children}</div>
      </div>
    </section>
  );
}
