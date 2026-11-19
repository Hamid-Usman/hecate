/**
 * The shapes hecates-backend returns (see its src/responses.ts and /docs). Kept identical so wiring
 * the real API later only means replacing the bodies in lib/data.ts and lib/actions.ts.
 */
export type Role = "owner" | "admin" | "member";
export type Environment = "development" | "production";
export type ProjectStatus = "active" | "suspended";
export type ConflictPolicy = "" | "server-wins" | "client-wins" | "last-write-wins" | "application";

export interface TableRule {
  tenant_column?: string;
  user_column?: string;
}
export interface Rules {
  tables: Record<string, TableRule>;
}
export interface Limits {
  max_batch?: number;
  requests_per_second?: number;
  burst?: number;
  events_per_day?: number;
  max_streams?: number;
}

export interface Project {
  id: string;
  accountId: string;
  name: string;
  environment: Environment;
  status: ProjectStatus;
  policy: ConflictPolicy;
  rules: Rules | null;
  limits: Limits;
  createdAt: string;
}

export interface SigningKey {
  kid: string;
  revoked: boolean;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  label: string;
  revoked: boolean;
  createdAt: string;
}

export interface ProjectDetail extends Project {
  role: Role;
  signingKeys: SigningKey[];
  apiKeys: ApiKey[];
}

export interface UsageDay {
  day: string;
  eventsApplied: number;
  pushes: number;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  detail: Record<string, unknown>;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  plan: string;
  role: Role;
}

export interface Me {
  user: { id: string; email: string; name?: string };
  accounts: Account[];
}
