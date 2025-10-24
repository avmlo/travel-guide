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
  muted: "bg-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.05)] backdrop-blur dark:bg-slate-900/50",
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
          "rounded-[32px] border border-slate-300/40",
          tone === "default" ? "bg-transparent" : "",
          toneClasses[tone],
          bleed ? "px-4 py-14 sm:px-6 lg:px-10" : "py-14 sm:py-16",
        )}
      >
        {(eyebrow || title || description || actions) && (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3 sm:max-w-2xl">
              {eyebrow && (
                <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
                  <span className="h-px w-5 bg-slate-400/70" aria-hidden="true" />
                  {eyebrow}
                </span>
              )}
              {title && (
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[2.75rem] sm:leading-[1.1] dark:text-slate-50">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </div>
        )}
        <div className={cn("mt-10", bleed && "mx-auto max-w-6xl")}>{children}</div>
      </div>
    </section>
  );
}
