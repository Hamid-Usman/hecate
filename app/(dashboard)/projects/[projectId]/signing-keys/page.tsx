import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectData, type ProjectParams } from "@/components/projects/project-data";
import { SigningKeysPanel } from "@/components/projects/signing-keys-panel";
import { Section, Skeleton } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Signing keys — Hecate" };

export default function SigningKeysPage({ params }: { params: ProjectParams }) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <ProjectData params={params}>
        {(p) => (
          <Section title="Signing keys" description="The secrets Hecate uses to sign and check device tokens. You never see them; you only rotate and revoke.">
            <SigningKeysPanel projectId={p.id} initial={p.signingKeys} readOnly={p.role === "member"} />
          </Section>
        )}
      </ProjectData>
    </Suspense>
  );
}
