"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { domAnimation, LazyMotion } from "framer-motion";
import { useState } from "react";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers/_app";
import { TRPCProvider as TRPCContextProvider } from "./client";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCContextProvider trpcClient={trpcClient} queryClient={queryClient}>
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>
      </TRPCContextProvider>
    </QueryClientProvider>
  );
}
