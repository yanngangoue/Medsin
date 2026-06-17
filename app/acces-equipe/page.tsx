import { notFound } from "next/navigation";
import { AccesEquipeClient } from "@/components/dev/AccesEquipeClient";
import { isStaffDemoLoginEnabled, listStaffDemoAccounts } from "@/lib/staff-demo-login";

export default function AccesEquipePage() {
  if (!isStaffDemoLoginEnabled()) {
    notFound();
  }

  return <AccesEquipeClient roles={listStaffDemoAccounts()} />;
}
