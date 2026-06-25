import { redirect } from "next/navigation";

export default function DashboardAdminLayoutRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  redirect("/admin/dashboard");
}
