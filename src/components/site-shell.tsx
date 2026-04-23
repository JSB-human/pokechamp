import Link from "next/link";

const navigation = [
  { href: "/", label: "홈" },
  { href: "/pokedex", label: "포켓몬 도감" },
  { href: "/moves", label: "기술 도감" },
  { href: "/items", label: "도구 도감" },
  { href: "/abilities", label: "특성 도감" },
  { href: "/type-chart", label: "상성표" },
  { href: "/samples", label: "샘플" },
  { href: "/builder", label: "파티 빌더" },
  { href: "/calculator", label: "계산기" },
  { href: "/stats", label: "통계" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ui-shell-bg min-h-screen text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/92 shadow-[0_10px_30px_rgba(15,45,122,0.08)] backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[1.35rem] bg-[linear-gradient(135deg,#0f4cfd_0%,#ff6b1a_130%)] text-lg font-bold text-white shadow-[0_18px_40px_rgba(15,76,253,0.24)]">
              <span className="relative z-10">P</span>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_36%)]" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-extrabold tracking-[0.24em] text-orange-600">
                포켓몬 챔피언스
              </div>
              <div className="truncate text-lg font-bold tracking-tight text-slate-950">
                포켓몬 챔피언스 데이터 허브
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-center text-sm font-semibold leading-5 text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 hover:shadow-[0_10px_30px_rgba(15,76,253,0.14)] xl:px-4"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-200 lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-6 sm:px-6 lg:px-8">{children}</main>

      <footer className="border-t border-slate-200 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1.3fr_0.9fr] lg:px-8">
          <div>
            <div className="text-sm font-semibold text-slate-900">쉽고 예쁜 포켓몬 챔피언스 데이터</div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              도감, 기술, 도구, 특성, 파티 빌더, 계산기를 한국어 중심으로 연결해 처음 보는 분도 바로 사용할 수 있는 흐름을 목표로 만들고 있습니다.
            </p>
          </div>
          <div className="grid gap-2 text-sm font-medium text-slate-600 sm:grid-cols-2">
            <span>한글 도감</span>
            <span>파티 빌더</span>
            <span>상성표</span>
            <span>계산기</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
