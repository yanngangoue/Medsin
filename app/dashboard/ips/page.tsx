import { redirect } from "next/navigation";
import { IpsQueueDashboard } from "@/components/ips/IpsQueueDashboard";
import { requireIpsSession } from "@/lib/ips/auth";

export default async function IpsDashboardPage() {
  const session = await requireIpsSession();
  if (!session) redirect("/connexion?callbackUrl=/dashboard/ips");

  return <IpsQueueDashboard />;
}
