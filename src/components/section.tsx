import type { ReactNode } from "react";

export function PageSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 ${className}`}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-sm font-bold uppercase tracking-wider text-sky-700">
      {children}
    </p>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`soft-card break-words rounded-lg p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-sky-200 bg-sky-50/70 p-5 text-center sm:p-6">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-white text-xl font-black text-sky-700 shadow-sm">
        ~
      </div>
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-slate-600">{children}</div>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function StatusMessage({
  ok,
  children,
  className = "",
}: {
  ok: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={`rounded-lg border p-3 text-sm font-medium ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-800"
      } ${className}`}
    >
      {children}
    </p>
  );
}
