import type { Metadata } from "next";
import { SettingsView } from "@/components/projects/project-views";

export const metadata: Metadata = { title: "Settings — Hecate" };

export default function Page() {
  return <SettingsView />;
}
