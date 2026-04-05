import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { z } from "zod";
import { EventFilters, EventSchema } from "../types/event";

const EventsPageSchema = z.object({
  events: z.array(EventSchema),
  total: z.number(),
});

type EventsPage = z.infer<typeof EventsPageSchema>;

export function useEvents(filters?: EventFilters) {
  const query = useInfiniteQuery({
    queryKey: ["events", filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<EventsPage> => {
      const params: Record<string, string> = { page: String(pageParam) };
      if (filters?.criticality) params.criticality = filters.criticality;
      if (filters?.result) params.result = filters.result;
      if (filters?.search) params.search = filters.search;

      const response = await api.get<unknown>("/v1/audit/events", { params });
      const parsed = EventsPageSchema.safeParse(response);
      console.log(parsed);

      if (!parsed.success) {
        throw new Error("Resposta inválida do servidor");
      }

      return parsed.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (acc, page) => acc + page.events.length,
        0,
      );
      if (loaded >= lastPage.total) return undefined;
      if (lastPage.events.length === 0) return undefined;
      return allPages.length + 1;
    },
    staleTime: 30000,
    refetchInterval: (q) => (q.state.data?.pages.length === 1 ? 60000 : false),
    retry: 0,
  });

  const events = query.data?.pages.flatMap((page) => page.events) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return { ...query, events, total };
}
