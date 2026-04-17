export function DataPageShell({
  eyebrow,
  title,
  description,
  stats,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 text-white shadow-[0_30px_120px_rgba(15,23,42,0.24)]">
        <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.3fr_0.9fr] md:px-8 md:py-10">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">
              {eyebrow}
            </span>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{description}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4 backdrop-blur"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {stat.label}
                </div>
                <div className="mt-3 text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="rounded-[2rem] border border-white/70 bg-white/88 p-5 shadow-[0_24px_100px_rgba(148,163,184,0.16)] backdrop-blur">
        {children}
      </section>
    </div>
  );
}
