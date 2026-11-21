import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectTabs } from "@/components/projects/project-tabs";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <ProjectHeader />
      <ProjectTabs />
      <div>{children}</div>
    </div>
  );
}
