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
      <section className="relative overflow-hidden rounded-[2.2rem] border border-blue-950/20 bg-[linear-gradient(135deg,#082f75_0%,#0f4cfd_48%,#0891b2_100%)] text-white shadow-[0_36px_120px_rgba(15,76,253,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,107,26,0.38),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.28),transparent_30%)]" />
        <div className="absolute right-[-4rem] top-[-4rem] size-48 rounded-full border border-white/15 bg-white/10 blur-2xl" />
        <div className="relative grid min-w-0 gap-8 px-6 py-8 md:grid-cols-[1.3fr_0.9fr] md:px-8 md:py-10">
          <div className="min-w-0 space-y-4">
            <span className="inline-flex max-w-full rounded-full border border-orange-200/60 bg-orange-400/22 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-orange-50">
              {eyebrow}
            </span>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{title}</h1>
              <p className="max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">{description}</p>
            </div>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.4rem] border border-white/25 bg-white/16 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur"
              >
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-50">
                  {stat.label}
                </div>
                <div className="mt-3 text-2xl font-bold leading-tight">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ui-card rounded-[2rem] p-5 backdrop-blur">
        {children}
      </section>
    </div>
  );
}
