import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { User } from "@/lib/types";

// One shared "who am I" query — AppShell and Login both read this cache entry.
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<User>("/auth/me"),
    retry: false,
  });
}
