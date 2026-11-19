import "server-only";

/**
 * The public URL of the Hecate engine that developers' apps sync with. Shown in setup guides and
 * code snippets, so it must be the address apps can reach, not an internal one.
 */
export const engineUrl = () => (process.env.ENGINE_URL ?? "http://localhost:8080").replace(/\/+$/, "");
