import Link from "next/link";
import { PokemonThumb } from "@/components/media";
import { teamPresets } from "@/data/champions-data";
import { toKoreanPokemonName } from "@/lib/korean";

export function SamplesBrowser() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {teamPresets.map((preset) => (
        <article
          key={preset.id}
          className="rounded-[1.6rem] border border-slate-200 bg-gradient-to-br from-white to-orange-50/40 p-5 shadow-sm"
        >
          <div className="text-lg font-bold">{preset.name}</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{preset.description}</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {preset.members.map((member) => (
              <div key={member} className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm">
                <div className="mx-auto flex size-14 items-center justify-center rounded-[1rem] bg-slate-50">
                  <PokemonThumb slugOrName={member} alt={toKoreanPokemonName(member)} className="size-10" />
                </div>
                <div className="mt-2 text-xs font-medium text-slate-700">{toKoreanPokemonName(member)}</div>
              </div>
            ))}
          </div>
          <Link
            href="/builder"
            className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            이 조합으로 빌더 가기
          </Link>
        </article>
      ))}
    </div>
  );
}
