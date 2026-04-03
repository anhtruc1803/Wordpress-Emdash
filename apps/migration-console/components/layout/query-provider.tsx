"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import type { SupportedLocale } from "@/lib/i18n/ui";

import { LocaleProvider } from "./locale-provider";

export function QueryProvider({
  children,
  initialLocale
}: {
  children: React.ReactNode;
  initialLocale: SupportedLocale;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 10_000
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
    </QueryClientProvider>
  );
}
