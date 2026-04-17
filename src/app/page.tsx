import { HomeDashboard } from "@/components/home-dashboard";
import { getNamuOverview, getOpggOverview } from "@/lib/collected-data";

export default function Home() {
  const overview = getOpggOverview();
  const namuOverview = getNamuOverview();

  return <HomeDashboard overview={overview} namuOverview={namuOverview} />;
}
