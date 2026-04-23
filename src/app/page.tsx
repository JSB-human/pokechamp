import { HomeDashboard } from "@/components/home-dashboard";
import { getOpggOverview } from "@/lib/collected-data";
import { getCatalogPokemon } from "@/lib/pokemon-catalog";

export default function Home() {
  const overview = getOpggOverview();
  const catalog = getCatalogPokemon();

  return <HomeDashboard overview={overview} catalog={catalog} />;
}
