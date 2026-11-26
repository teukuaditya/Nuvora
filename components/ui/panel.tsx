import type { ReactNode } from "react";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[2rem] border border-border bg-surface/90 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm dark:bg-surface/70 ${className}`}>
      {children}
    </section>
  );
}
