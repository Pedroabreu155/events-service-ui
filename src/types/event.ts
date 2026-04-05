import { z } from "zod";

export const CriticalitySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type Criticality = z.infer<typeof CriticalitySchema>;

export const ResultSchema = z.enum(["SUCCESS", "FAILURE"]);
export type Result = z.infer<typeof ResultSchema>;

/**
 * Formato Oficial dos Eventos (Audit API)
 *
 * @example
 * {
 *   "timestamp": "2025-10-07T14:00:00Z",
 *   "userId": 1,
 *   "clientId": 1,
 *   "eventType": "USER_LOGIN",
 *   "sourceIp": "127.0.0.1",
 *   "criticality": "MEDIUM",
 *   "result": "SUCCESS",
 *   "correlationId": "uuid-v4",
 *   "entityId": "entity-123",
 *   "details": { "method": "POST", "path": "/api/v1/login" }
 * }
 */
export const EventSchema = z.object({
  timestamp: z.string().datetime(),
  userId: z.number(),
  id: z.number(),
  clientId: z.number(),
  eventType: z.string(),
  sourceIp: z.string(),
  criticality: CriticalitySchema,
  result: ResultSchema,
  correlationId: z.string().optional(),
  entityId: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

export type Event = z.infer<typeof EventSchema>;

export const EventFiltersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  criticality: CriticalitySchema.optional(),
  result: ResultSchema.optional(),
  clientId: z.number().optional(),
  userId: z.number().optional(),
  eventType: z.string().optional(),
  limit: z.number().optional(),
});

export type EventFilters = z.infer<typeof EventFiltersSchema>;
