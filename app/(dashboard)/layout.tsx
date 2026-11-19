import { DashboardShell } from "@/components/dashboard/shell";
import { getMe, listAllProjects } from "@/lib/data";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [me, projects] = await Promise.all([getMe(), listAllProjects()]);
  return (
    <DashboardShell me={me} projects={projects}>
      {children}
    </DashboardShell>
  );
}
