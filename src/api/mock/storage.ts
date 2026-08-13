import type { SavedReport } from '@/types/report';
import { savedReportSchema } from '@/schemas/report';

const STORAGE_KEY = 'rb:reports';
const SEED_FLAG_KEY = 'rb:seeded';

function nowIso(): string {
  return new Date().toISOString();
}

function seedReports(): SavedReport[] {
  const t = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();
  return [
    {
      id: 'seed-1',
      name: 'Delayed Trips — Last 30 Days',
      description: 'Trips with a delay, most recent first.',
      definition: {
        dataset: 'trips',
        visualization: 'table',
        columns: ['trip_id', 'route_name', 'driver_name', 'status', 'started_at', 'delay_minutes'],
        filters: [{ id: 'f1', field: 'status', op: 'in', value: ['Delayed'] }],
        sort: [{ field: 'started_at', dir: 'desc' }],
        limit: 100,
      },
      createdAt: t(60 * 24 * 6),
      updatedAt: t(60 * 3),
    },
    {
      id: 'seed-2',
      name: 'Active Routes by Zone',
      description: 'All currently active routes grouped visually by zone.',
      definition: {
        dataset: 'routes',
        visualization: 'table',
        columns: ['route_name', 'zone', 'school_name', 'stop_count', 'distance_km', 'active'],
        filters: [{ id: 'f1', field: 'active', op: 'eq', value: true }],
        sort: [{ field: 'zone', dir: 'asc' }],
        limit: 100,
      },
      createdAt: t(60 * 24 * 12),
      updatedAt: t(60 * 24 * 2),
    },
    {
      id: 'seed-3',
      name: 'Driver Roster & Ratings',
      description: 'Full driver roster sorted by rating.',
      definition: {
        dataset: 'drivers',
        visualization: 'table',
        columns: ['driver_name', 'assigned_route', 'years_experience', 'rating', 'active'],
        filters: [],
        sort: [{ field: 'rating', dir: 'desc' }],
        limit: 50,
      },
      createdAt: t(60 * 24 * 20),
      updatedAt: t(60 * 24 * 20),
    },
    {
      id: 'seed-4',
      name: 'Student Boarding Activity',
      description: 'Boarding/alighting events for the Al Reem Loop route.',
      definition: {
        dataset: 'student_trip_history',
        visualization: 'table',
        columns: ['student_name', 'trip_id', 'stop_name', 'boarded_at', 'boarded'],
        filters: [{ id: 'f1', field: 'route_name', op: 'eq', value: 'Route 12 - Al Reem Loop' }],
        sort: [{ field: 'boarded_at', dir: 'desc' }],
        limit: 100,
      },
      createdAt: t(60 * 24 * 3),
      updatedAt: t(30),
    },
  ];
}

function readAll(): SavedReport[] {
  if (typeof localStorage === 'undefined') return [];
  const seeded = localStorage.getItem(SEED_FLAG_KEY);
  if (!seeded) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedReports()));
    localStorage.setItem(SEED_FLAG_KEY, '1');
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((r): r is SavedReport => savedReportSchema.safeParse(r).success);
  } catch {
    return [];
  }
}

function writeAll(reports: SavedReport[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function storageListReports(): SavedReport[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function storageGetReport(id: string): SavedReport | undefined {
  return readAll().find((r) => r.id === id);
}

export function storageSaveReport(
  input: Omit<SavedReport, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): SavedReport {
  const reports = readAll();
  if (input.id) {
    const idx = reports.findIndex((r) => r.id === input.id);
    if (idx === -1) {
      throw new Error(`Report "${input.id}" not found`);
    }
    const existing = reports[idx] as SavedReport;
    const updated: SavedReport = {
      ...existing,
      name: input.name,
      updatedAt: nowIso(),
      definition: input.definition,
    };
    if (input.description !== undefined) updated.description = input.description;
    reports[idx] = updated;
    writeAll(reports);
    return updated;
  }

  const created: SavedReport = {
    id: `rpt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    definition: input.definition,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  if (input.description !== undefined) created.description = input.description;
  reports.push(created);
  writeAll(reports);
  return created;
}

export function storageDeleteReport(id: string): void {
  const reports = readAll().filter((r) => r.id !== id);
  writeAll(reports);
}
