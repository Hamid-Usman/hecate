import type { Metadata } from "next";
import { OverviewView } from "@/components/projects/project-views";

export const metadata: Metadata = { title: "Overview — Hecate" };

export default function Page() {
  return <OverviewView />;
}
