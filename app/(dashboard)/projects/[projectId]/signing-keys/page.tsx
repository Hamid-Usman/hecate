import type { Metadata } from "next";
import { SigningKeysView } from "@/components/projects/project-views";

export const metadata: Metadata = { title: "Signing keys — Hecate" };

export default function Page() {
  return <SigningKeysView />;
}
