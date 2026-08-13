import type { CatalogDataset, ColumnType } from '@/types/catalog';
import { buildCatalogColumns } from './capabilities';
import {
  generateTrips,
  generateRoutes,
  generateStudents,
  generateStudentTripHistory,
  generateDrivers,
} from './generators';

interface ColumnDecl {
  name: string;
  label: string;
  type: ColumnType;
}

function labelize(name: string): string {
  return name
    .split('_')
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');
}

function decl(name: string, type: ColumnType, label?: string): ColumnDecl {
  return { name, type, label: label ?? labelize(name) };
}

const trips = generateTrips();
const routes = generateRoutes();
const students = generateStudents();
const studentTripHistory = generateStudentTripHistory(students, trips);
const drivers = generateDrivers();

const tripsDecls: ColumnDecl[] = [
  decl('trip_id', 'string', 'Trip ID'),
  decl('route_name', 'string', 'Route'),
  decl('school_name', 'string', 'School'),
  decl('driver_name', 'string', 'Driver'),
  decl('vehicle_plate', 'string', 'Vehicle Plate'),
  decl('status', 'string', 'Status'),
  decl('started_at', 'timestamp', 'Started At'),
  decl('ended_at', 'timestamp', 'Ended At'),
  decl('duration_minutes', 'number', 'Duration (min)'),
  decl('distance_km', 'number', 'Distance (km)'),
  decl('student_count', 'number', 'Student Count'),
  decl('delay_minutes', 'number', 'Delay (min)'),
  decl('is_return_trip', 'boolean', 'Return Trip'),
  decl('start_lat', 'geo', 'Start Latitude'),
  decl('start_lng', 'geo', 'Start Longitude'),
];

const routesDecls: ColumnDecl[] = [
  decl('route_id', 'string', 'Route ID'),
  decl('route_name', 'string', 'Route'),
  decl('zone', 'string', 'Zone'),
  decl('school_name', 'string', 'School'),
  decl('stop_count', 'number', 'Stop Count'),
  decl('distance_km', 'number', 'Distance (km)'),
  decl('estimated_duration_minutes', 'number', 'Est. Duration (min)'),
  decl('active', 'boolean', 'Active'),
  decl('created_at', 'date', 'Created At'),
];

const studentsDecls: ColumnDecl[] = [
  decl('student_id', 'string', 'Student ID'),
  decl('full_name', 'string', 'Full Name'),
  decl('grade', 'string', 'Grade'),
  decl('school_name', 'string', 'School'),
  decl('route_name', 'string', 'Route'),
  decl('stop_name', 'string', 'Stop'),
  decl('enrolled_at', 'date', 'Enrolled At'),
  decl('active', 'boolean', 'Active'),
];

const studentTripHistoryDecls: ColumnDecl[] = [
  decl('record_id', 'string', 'Record ID'),
  decl('student_id', 'string', 'Student ID'),
  decl('student_name', 'string', 'Student Name'),
  decl('trip_id', 'string', 'Trip ID'),
  decl('route_name', 'string', 'Route'),
  decl('stop_name', 'string', 'Stop'),
  decl('boarded_at', 'timestamp', 'Boarded At'),
  decl('alighted_at', 'timestamp', 'Alighted At'),
  decl('boarded', 'boolean', 'Boarded'),
  decl('school_name', 'string', 'School'),
];

const driversDecls: ColumnDecl[] = [
  decl('driver_id', 'string', 'Driver ID'),
  decl('driver_name', 'string', 'Driver Name'),
  decl('license_expiry', 'date', 'License Expiry'),
  decl('years_experience', 'number', 'Years Experience'),
  decl('assigned_route', 'string', 'Assigned Route'),
  decl('rating', 'number', 'Rating'),
  decl('active', 'boolean', 'Active'),
];

export const MOCK_ROWS: Record<string, Record<string, unknown>[]> = {
  trips: trips as unknown as Record<string, unknown>[],
  routes: routes as unknown as Record<string, unknown>[],
  students: students as unknown as Record<string, unknown>[],
  student_trip_history: studentTripHistory as unknown as Record<string, unknown>[],
  drivers: drivers as unknown as Record<string, unknown>[],
};

export const MOCK_CATALOG: CatalogDataset[] = [
  {
    name: 'trips',
    label: 'Trips',
    space: 'Reporting',
    description: 'Individual school bus trips with timing, route and status detail.',
    rowCountEstimate: trips.length,
    columns: buildCatalogColumns(tripsDecls, MOCK_ROWS.trips ?? []),
  },
  {
    name: 'routes',
    label: 'Routes',
    space: 'Reporting',
    description: 'Bus routes serving each school and zone.',
    rowCountEstimate: routes.length,
    columns: buildCatalogColumns(routesDecls, MOCK_ROWS.routes ?? []),
  },
  {
    name: 'students',
    label: 'Students',
    space: 'Operations',
    description: 'Enrolled students and their assigned route/stop.',
    rowCountEstimate: students.length,
    columns: buildCatalogColumns(studentsDecls, MOCK_ROWS.students ?? []),
  },
  {
    name: 'student_trip_history',
    label: 'Student Trip History',
    space: 'Operations',
    description: 'Per-student boarding and alighting events for each trip.',
    rowCountEstimate: studentTripHistory.length,
    columns: buildCatalogColumns(studentTripHistoryDecls, MOCK_ROWS.student_trip_history ?? []),
  },
  {
    name: 'drivers',
    label: 'Drivers',
    space: 'Operations',
    description: 'Driver roster, licensing and performance.',
    rowCountEstimate: drivers.length,
    columns: buildCatalogColumns(driversDecls, MOCK_ROWS.drivers ?? []),
  },
];
