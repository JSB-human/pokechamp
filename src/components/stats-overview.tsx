import { ItemThumb, PokemonThumb } from "@/components/media";
import { pokemonData } from "@/data/champions-data";
import { toKoreanItemName, toKoreanPokemonName, toKoreanRole } from "@/lib/korean";
import { buildItemLeaderboard, buildRoleOverview } from "@/lib/recommendations";

export function StatsOverview() {
  const topUsage = [...pokemonData].sort((a, b) => b.usage - a.usage).slice(0, 6);
  const items = buildItemLeaderboard();
  const roles = buildRoleOverview();

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">상위 사용 포켓몬</h2>
        <div className="mt-4 space-y-3">
          {topUsage.map((pokemon) => (
            <div key={pokemon.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-white">
                  <PokemonThumb slugOrName={pokemon.id} alt={toKoreanPokemonName(pokemon.name, pokemon.id)} className="size-9" />
                </div>
                <span className="font-medium">{toKoreanPokemonName(pokemon.name, pokemon.id)}</span>
              </div>
              <span className="text-sm font-semibold text-slate-600">{pokemon.usage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">자주 보이는 도구</h2>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.item} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-white">
                  <ItemThumb slugOrName={item.item} alt={toKoreanItemName(item.item)} className="size-8" />
                </div>
                <span className="font-medium">{toKoreanItemName(item.item)}</span>
              </div>
              <span className="text-sm font-semibold text-slate-600">{item.count}세트</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">역할 분포</h2>
        <div className="mt-4 space-y-3">
          {roles.map((role) => (
            <div key={role.role} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="font-medium">{toKoreanRole(role.role)}</span>
              <span className="text-sm font-semibold text-slate-600">{role.count}마리</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
