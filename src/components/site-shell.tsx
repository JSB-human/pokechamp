import Link from "next/link";

const navigation = [
  { href: "/", label: "홈" },
  { href: "/pokedex", label: "포켓몬 도감" },
  { href: "/moves", label: "기술 도감" },
  { href: "/items", label: "도구 도감" },
  { href: "/abilities", label: "특성 도감" },
  { href: "/samples", label: "샘플" },
  { href: "/builder", label: "파티 빌더" },
  { href: "/calculator", label: "계산기" },
  { href: "/stats", label: "통계" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,196,143,0.24),_transparent_28%),linear-gradient(180deg,_#fffaf4_0%,_#fffefb_34%,_#f6faff_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/82 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white shadow-lg shadow-slate-900/20">
              P
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">포챔코리아</div>
              <div className="text-lg font-bold tracking-tight">포켓몬 챔피언스 데이터</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-2 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      <footer className="border-t border-slate-200/80 bg-white/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
          <p>포켓몬 챔피언스를 더 쉽고 친근하게 보기 위한 한국어 중심 데이터 허브입니다.</p>
          <p>수집 기준: 포케베이스, OP.GG, 나무위키, 스마트누오 참고 데이터</p>
        </div>
      </footer>
    </div>
  );
}
