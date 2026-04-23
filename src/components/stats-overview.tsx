import { ItemThumb, PokemonThumb } from "@/components/media";
import { toKoreanItemName, toKoreanPokemonName, toKoreanRole } from "@/lib/korean";
import { buildItemLeaderboard, buildRoleOverview } from "@/lib/recommendations";
import type { CatalogPokemon } from "@/types/pokemon";

export function StatsOverview({ catalog }: { catalog: CatalogPokemon[] }) {
  const topUsage = [...catalog].sort((a, b) => b.usage - a.usage).slice(0, 6);
  const items = buildItemLeaderboard(catalog);
  const roles = buildRoleOverview(catalog);

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <section className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffaf5_100%)] p-5 shadow-[0_16px_50px_rgba(148,163,184,0.10)]">
        <h2 className="text-xl font-bold">상위 추천 포켓몬</h2>
        <div className="mt-4 space-y-3">
          {topUsage.map((pokemon, index) => (
            <div key={pokemon.id} className="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-white">
                  <PokemonThumb
                    slugOrName={pokemon.id}
                    src={pokemon.iconUrl}
                    alt={toKoreanPokemonName(pokemon.name, pokemon.id)}
                    className="size-9"
                  />
                </div>
                <span className="font-medium">{toKoreanPokemonName(pokemon.name, pokemon.id)}</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-orange-500">상위 {index + 1}</div>
                <div className="text-sm font-semibold text-slate-600">{pokemon.usageLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffaf2_100%)] p-5 shadow-[0_16px_50px_rgba(148,163,184,0.10)]">
        <h2 className="text-xl font-bold">대표 추천 도구</h2>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.item} className="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-white">
                  <ItemThumb slugOrName={item.item} alt={toKoreanItemName(item.item)} className="size-8" />
                </div>
                <span className="font-medium">{toKoreanItemName(item.item)}</span>
              </div>
              <span className="text-sm font-semibold text-slate-600">{item.count}마리</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f5fffb_100%)] p-5 shadow-[0_16px_50px_rgba(148,163,184,0.10)]">
        <h2 className="text-xl font-bold">역할 분포</h2>
        <div className="mt-4 space-y-3">
          {roles.map((role) => (
            <div key={role.role} className="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <span className="font-medium">{toKoreanRole(role.role)}</span>
              <span className="text-sm font-semibold text-slate-600">{role.count}마리</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
