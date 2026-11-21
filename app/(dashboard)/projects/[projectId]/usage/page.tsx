import type { Metadata } from "next";
import { UsageView } from "@/components/projects/project-views";

export const metadata: Metadata = { title: "Usage — Hecate" };

export default function Page() {
  return <UsageView />;
}
