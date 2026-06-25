"use client";

import useSWR from "swr";
import { fetchBootstrap } from "@/lib/api/client";

export function useAppData() {
  const response = useSWR("/api/bootstrap", fetchBootstrap, {
    revalidateOnFocus: false,
  });

  return {
    ...response,
    data: response.data,
    isLoading: response.isLoading,
    refresh: response.mutate,
  };
}
