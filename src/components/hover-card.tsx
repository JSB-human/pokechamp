import type { ReactNode } from "react";

type HoverCardProps = {
  children: ReactNode;
  title: string;
  description?: string | null;
  meta?: string | null;
  className?: string;
};

export function HoverCard({ children, title, description, meta, className = "" }: HoverCardProps) {
  return (
    <span className={`group/hovercard relative inline-flex max-w-full ${className}`} tabIndex={0}>
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_24px_70px_rgba(15,23,42,0.18)] group-hover/hovercard:block group-focus/hovercard:block">
        <span className="block text-sm font-black text-slate-950">{title}</span>
        {meta ? <span className="mt-1 block text-xs font-black text-orange-600">{meta}</span> : null}
        {description ? <span className="mt-2 block text-xs leading-5 text-slate-600">{description}</span> : null}
      </span>
    </span>
  );
}
