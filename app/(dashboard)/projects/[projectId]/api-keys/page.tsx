import type { Metadata } from "next";
import { ApiKeysView } from "@/components/projects/project-views";

export const metadata: Metadata = { title: "API keys — Hecate" };

export default function Page() {
  return <ApiKeysView />;
}
