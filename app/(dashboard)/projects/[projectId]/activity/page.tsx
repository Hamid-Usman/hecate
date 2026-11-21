import type { Metadata } from "next";
import { ActivityView } from "@/components/projects/project-views";

export const metadata: Metadata = { title: "Activity — Hecate" };

export default function Page() {
  return <ActivityView />;
}
