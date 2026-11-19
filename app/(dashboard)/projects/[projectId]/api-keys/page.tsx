import type { Metadata } from "next";
import { Suspense } from "react";
import { ApiKeysPanel } from "@/components/projects/api-keys-panel";
import { ProjectData, type ProjectParams } from "@/components/projects/project-data";
import { CodeBlock } from "@/components/ui/copy";
import { Section, Skeleton } from "@/components/ui/primitives";
import { engineUrl } from "@/lib/config";

export const metadata: Metadata = { title: "API keys — Hecate" };

export default function ApiKeysPage({ params }: { params: ProjectParams }) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <ProjectData params={params}>
        {(p) => (
          <div className="space-y-10">
            <Section title="API keys" description="Server-side credentials. Your backend trades one for a short-lived token for each device.">
              <ApiKeysPanel projectId={p.id} initial={p.apiKeys} readOnly={p.role === "member"} />
            </Section>
            <Section title="Using a key" description="Call this from your server when a user signs in to your app, then pass the token to the device.">
              <CodeBlock
                title="POST /v1/tokens"
                code={`curl -X POST ${engineUrl()}/v1/tokens \\
  -H "Authorization: Bearer hsk.…" \\
  -H "Content-Type: application/json" \\
  -d '{
    "device_id": "device-123",
    "user_id": "user-42",
    "tenant_id": "store-7",
    "ttl_seconds": 3600
  }'

# → { "token": "hct1.…", "expires_at": "…" }`}
              />
            </Section>
          </div>
        )}
      </ProjectData>
    </Suspense>
  );
}
