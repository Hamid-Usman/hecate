import type { Metadata } from "next";
import { RulesView } from "@/components/projects/project-views";

export const metadata: Metadata = { title: "Rules — Hecate" };

export default function Page() {
  return <RulesView />;
}
