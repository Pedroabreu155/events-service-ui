import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { Event, EventFilters } from "../types/event";

export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      // In a real scenario, we would pass filters as search params
      const params: Record<string, string> = {};
      if (filters?.severity) params.severity = filters.severity;
      if (filters?.status) params.status = filters.status;
      if (filters?.search) params.search = filters.search;

      const response = await api.get<any>("/v1/audit/events", { params });

      // Handle common API patterns (direct array or wrapped in data/events property)
      if (Array.isArray(response)) return response;
      if (response && Array.isArray(response.events)) return response.events;
      if (response && Array.isArray(response.data)) return response.data;

      return [];
    },
    // Keep data fresh for 30 seconds
    staleTime: 30000,
    // Refetch every 1 minute
    refetchInterval: 60000,
    // Disable retries for faster feedback on connection issues
    retry: 0,
  });
}

export function useEventDetails(id: string) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: async () => {
      const response = await api.get<any>(`/v1/audit/events/${id}`);
      // Handle wrapped data if necessary
      return response?.event || response?.data || response;
    },
    enabled: !!id,
  });
}
