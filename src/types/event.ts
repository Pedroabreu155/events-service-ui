import { z } from 'zod';

export const EventSeveritySchema = z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']);
export type EventSeverity = z.infer<typeof EventSeveritySchema>;

export const EventStatusSchema = z.enum(['PENDING', 'PROCESSED', 'FAILED']);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  severity: EventSeveritySchema,
  status: EventStatusSchema,
  source: z.string(),
  payload: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Event = z.infer<typeof EventSchema>;

export const EventFiltersSchema = z.object({
  severity: EventSeveritySchema.optional(),
  status: EventStatusSchema.optional(),
  search: z.string().optional(),
});

export type EventFilters = z.infer<typeof EventFiltersSchema>;
