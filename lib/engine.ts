import "server-only";
import axios from "axios";
import { engineUrl } from "./config";

export type EngineHealth = { reachable: true; version: string; authRequired: boolean } | { reachable: false };

/**
 * GET {engine}/health. Free hosting puts idle services to sleep and the first request can take
 * ~15 s, so a miss is reported as "not reachable yet", never as a hard failure.
 */
export async function getEngineHealth(): Promise<EngineHealth> {
  try {
    const { data } = await axios.get<{ status?: string; version?: string; auth?: boolean }>(`${engineUrl()}/health`, { timeout: 5_000 });
    if (data.status !== "healthy") return { reachable: false };
    return { reachable: true, version: data.version ?? "unknown", authRequired: data.auth !== false };
  } catch {
    return { reachable: false };
  }
}
