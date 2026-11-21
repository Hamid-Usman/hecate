import { connection } from "next/server";
import { Suspense } from "react";
import { DashboardShell, ShellSkeleton } from "@/components/dashboard/shell";
import { Providers } from "@/components/providers";
import { engineUrl } from "@/lib/config";

/**
 * The dashboard loads its data in the browser through React Query (see lib/queries.ts), which caches
 * it across pages. This layout only reads ENGINE_URL, at request time so it isn't fixed at build.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <WithProviders>{children}</WithProviders>
    </Suspense>
  );
}

async function WithProviders({ children }: { children: React.ReactNode }) {
  await connection();
  return (
    <Providers engineUrl={engineUrl()}>
      <DashboardShell>{children}</DashboardShell>
    </Providers>
  );
}
