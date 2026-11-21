"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import { ApiError } from "@/lib/errors";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data counts as fresh for a minute: navigating between pages reuses it with no request.
        staleTime: 60_000,
        // Unused data is dropped after 10 minutes.
        gcTime: 10 * 60_000,
        // Coming back to the tab refetches only what has gone stale.
        refetchOnWindowFocus: true,
        // 4xx answers (not found, forbidden, signed out) won't change on a retry.
        retry: (failures, error) => !(error instanceof ApiError && error.status < 500) && failures < 2,
      },
      mutations: { retry: false },
    },
  });
}

const EngineUrlContext = createContext("");

/** The public engine address, read on the server (ENGINE_URL) and handed to client components. */
export const useEngineUrl = () => useContext(EngineUrlContext);

export function Providers({ engineUrl, children }: { engineUrl: string; children: React.ReactNode }) {
  // One client per browser tab, created once: it holds the cache for the whole dashboard.
  const [client] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={client}>
      <EngineUrlContext.Provider value={engineUrl}>{children}</EngineUrlContext.Provider>
    </QueryClientProvider>
  );
}
