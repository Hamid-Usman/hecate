import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { Mark } from "@/components/landing/glyphs";
import { Skeleton } from "@/components/ui/primitives";
import { getMe, listAllProjects } from "@/lib/data";

/**
 * The session is read at request time, so the data-dependent shell sits behind Suspense (Cache
 * Components forbids reading cookies at a layout's top level). The page streams in inside it.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <ShellWithData>{children}</ShellWithData>
    </Suspense>
  );
}

async function ShellWithData({ children }: { children: React.ReactNode }) {
  const [me, projects] = await Promise.all([getMe(), listAllProjects()]);
  return (
    <DashboardShell me={me} projects={projects}>
      {children}
    </DashboardShell>
  );
}

function ShellFallback() {
  return (
    <div className="blueprint min-h-screen lg:grid lg:grid-cols-[272px_1fr]" aria-busy="true">
      <aside className="hidden space-y-3 border-r border-ink/10 bg-paper p-5 lg:block">
        <div className="flex h-8 items-center gap-2.5">
          <Mark className="h-7 w-7" animated={false} />
          <span className="font-serif text-2xl tracking-tight">Hecate</span>
        </div>
        <Skeleton className="h-14" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </aside>
      <main className="px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-20 max-w-md" />
          <Skeleton className="h-64" />
        </div>
      </main>
    </div>
  );
}
