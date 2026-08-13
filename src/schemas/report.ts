import { z } from 'zod';

const columnTypeSchema = z.enum(['string', 'number', 'date', 'timestamp', 'boolean', 'geo', 'unknown']);

const filterOpSchema = z.enum([
  'eq',
  'ne',
  'in',
  'nin',
  'contains',
  'startsWith',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'relative',
  'exists',
]);

const reportFilterSchema = z.object({
  id: z.string(),
  field: z.string(),
  op: filterOpSchema,
  value: z.unknown(),
});

const reportSortSchema = z.object({
  field: z.string(),
  dir: z.enum(['asc', 'desc']),
});

const reportParameterSchema = z.object({
  key: z.string(),
  type: columnTypeSchema,
  default: z.unknown(),
});

export const reportDefinitionSchema = z.object({
  dataset: z.string(),
  visualization: z.literal('table'),
  columns: z.array(z.string()),
  filters: z.array(reportFilterSchema),
  sort: z.array(reportSortSchema),
  limit: z.number().positive(),
  parameters: z.array(reportParameterSchema).optional(),
});

export const savedReportSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  definition: reportDefinitionSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SavedReportInput = z.infer<typeof savedReportSchema>;
