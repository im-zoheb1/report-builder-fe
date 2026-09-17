export type VizType = 'table' | 'bar' | 'line' | 'pie' | 'map' | 'kpi';
export type FieldType = 'date' | 'text' | 'number' | 'bool';
export type TripStatus = 'Completed' | 'Delayed' | 'Cancelled';
export type AvatarTone = 'indigo' | 'teal' | 'amber';

export interface Person {
  initials: string;
  shortName: string;
  tone: AvatarTone;
}

export interface Collection {
  name: string;
  count: string;
  docs: string;
}

export interface Report {
  id: string;
  name: string;
  viz: VizType;
  collection: string;
  updated: string;
  owner: Person;
}

export interface Dashboard {
  id: string;
  name: string;
  cards: number;
  viewed: string;
  owner: Person;
}

export interface Field {
  name: string;
  type: FieldType;
  selected: boolean;
  coverage?: string;
}

export interface TripRow {
  tripDate: string;
  routeName: string;
  driverName: string;
  status: TripStatus;
  studentCount: number;
}

export const people: Record<string, Person> = {
  layla: { initials: 'LH', shortName: 'Layla H.', tone: 'indigo' },
  omar: { initials: 'OS', shortName: 'Omar S.', tone: 'teal' },
  priya: { initials: 'PN', shortName: 'Priya N.', tone: 'amber' },
};

export const currentUser = { initials: 'LH', name: 'Layla Hassan' };

export const collections: Collection[] = [
  { name: 'trips', count: '48.2k', docs: '48.2k docs' },
  { name: 'routes', count: '36', docs: '36 docs' },
  { name: 'student_history', count: '212k', docs: '212k docs' },
  { name: 'drivers', count: '58', docs: '58 docs' },
  { name: 'vehicles', count: '44', docs: '44 docs' },
];

export const reports: Report[] = [
  {
    id: 'daily-trips-overview',
    name: 'Daily Trips Overview',
    viz: 'table',
    collection: 'trips',
    updated: 'Updated 2h ago',
    owner: people.layla!,
  },
  {
    id: 'trips-per-route',
    name: 'Trips per Route',
    viz: 'bar',
    collection: 'trips',
    updated: 'Updated yesterday',
    owner: people.omar!,
  },
  {
    id: 'trips-over-time',
    name: 'Trips Over Time',
    viz: 'line',
    collection: 'trips',
    updated: 'Updated 3d ago',
    owner: people.layla!,
  },
  {
    id: 'trip-status-breakdown',
    name: 'Trip Status Breakdown',
    viz: 'pie',
    collection: 'trips',
    updated: 'Updated Sep 12',
    owner: people.priya!,
  },
  {
    id: 'live-route-map',
    name: 'Live Route Map',
    viz: 'map',
    collection: 'routes',
    updated: 'Updated Sep 10',
    owner: people.omar!,
  },
  {
    id: 'total-trips-mtd',
    name: 'Total Trips (MTD)',
    viz: 'kpi',
    collection: 'trips',
    updated: 'Updated Sep 9',
    owner: people.layla!,
  },
  {
    id: 'student-ridership-history',
    name: 'Student Ridership History',
    viz: 'table',
    collection: 'student_history',
    updated: 'Updated Sep 4',
    owner: people.priya!,
  },
  {
    id: 'driver-on-time-rate',
    name: 'Driver On-Time Rate',
    viz: 'bar',
    collection: 'drivers',
    updated: 'Updated Aug 28',
    owner: people.omar!,
  },
];

export const dashboards: Dashboard[] = [
  {
    id: 'fleet-operations-overview',
    name: 'Fleet Operations Overview',
    cards: 8,
    viewed: 'Viewed 5 min ago',
    owner: people.layla!,
  },
  {
    id: 'route-performance',
    name: 'Route Performance',
    cards: 6,
    viewed: 'Viewed yesterday',
    owner: people.omar!,
  },
  {
    id: 'student-ridership',
    name: 'Student Ridership',
    cards: 5,
    viewed: 'Viewed Sep 14',
    owner: people.priya!,
  },
  {
    id: 'driver-scorecard',
    name: 'Driver Scorecard',
    cards: 7,
    viewed: 'Viewed Sep 11',
    owner: people.omar!,
  },
  {
    id: 'delays-cancellations',
    name: 'Delays & Cancellations',
    cards: 4,
    viewed: 'Viewed Sep 8',
    owner: people.layla!,
  },
];

export const tripFields: Field[] = [
  { name: 'trip_date', type: 'date', selected: true },
  { name: 'route.name', type: 'text', selected: true },
  { name: 'route.zone', type: 'text', selected: false },
  { name: 'driver.name', type: 'text', selected: true },
  { name: 'vehicle.plate', type: 'text', selected: false },
  { name: 'status', type: 'text', selected: true },
  { name: 'student_count', type: 'number', selected: true },
  { name: 'distance_km', type: 'number', selected: false },
  { name: 'delay_minutes', type: 'number', selected: false, coverage: '64% coverage' },
  { name: 'is_return_trip', type: 'bool', selected: false },
  { name: 'cancel_reason', type: 'text', selected: false, coverage: '8% coverage' },
  { name: 'notes', type: 'text', selected: false, coverage: '12% coverage' },
];

export const tripRows: TripRow[] = [
  {
    tripDate: 'Sep 17, 2026',
    routeName: 'Route 12 - Al Reem Loop',
    driverName: 'Khalid Mansoor',
    status: 'Completed',
    studentCount: 42,
  },
  {
    tripDate: 'Sep 17, 2026',
    routeName: 'Route 07 - Khalifa City A',
    driverName: 'Anil Thomas',
    status: 'Delayed',
    studentCount: 38,
  },
  {
    tripDate: 'Sep 17, 2026',
    routeName: 'Route 03 - Yas Island North',
    driverName: 'Yusuf Al Amri',
    status: 'Completed',
    studentCount: 29,
  },
  {
    tripDate: 'Sep 17, 2026',
    routeName: 'Route 21 - Mussafah West',
    driverName: 'Ravi Pillai',
    status: 'Cancelled',
    studentCount: 0,
  },
  {
    tripDate: 'Sep 16, 2026',
    routeName: 'Route 12 - Al Reem Loop',
    driverName: 'Khalid Mansoor',
    status: 'Completed',
    studentCount: 44,
  },
  {
    tripDate: 'Sep 16, 2026',
    routeName: 'Route 15 - Saadiyat Shore',
    driverName: 'Imran Sheikh',
    status: 'Completed',
    studentCount: 31,
  },
  {
    tripDate: 'Sep 16, 2026',
    routeName: 'Route 07 - Khalifa City A',
    driverName: 'Anil Thomas',
    status: 'Completed',
    studentCount: 40,
  },
  {
    tripDate: 'Sep 16, 2026',
    routeName: 'Route 09 - Al Raha Gardens',
    driverName: 'Samir Haddad',
    status: 'Delayed',
    studentCount: 35,
  },
  {
    tripDate: 'Sep 15, 2026',
    routeName: 'Route 03 - Yas Island North',
    driverName: 'Yusuf Al Amri',
    status: 'Completed',
    studentCount: 27,
  },
  {
    tripDate: 'Sep 15, 2026',
    routeName: 'Route 21 - Mussafah West',
    driverName: 'Ravi Pillai',
    status: 'Completed',
    studentCount: 33,
  },
  {
    tripDate: 'Sep 15, 2026',
    routeName: 'Route 18 - MBZ City',
    driverName: 'Faisal Noor',
    status: 'Delayed',
    studentCount: 36,
  },
];

export const tripsPerRoute = [
  { label: 'R12', fullLabel: 'Route 12', value: 186, students: 7812 },
  { label: 'R07', fullLabel: 'Route 07', value: 164, students: 6232 },
  { label: 'R09', fullLabel: 'Route 09', value: 142, students: 4200 },
  { label: 'R03', fullLabel: 'Route 03', value: 131, students: 4118 },
  { label: 'R15', fullLabel: 'Route 15', value: 120, students: 4061 },
  { label: 'R21', fullLabel: 'Route 21', value: 97, students: 3201 },
  { label: 'R18', fullLabel: 'Route 18', value: 88, students: 3168 },
];

export const tripsOverTime = [38, 44, 41, 52, 48, 57, 53, 61, 58, 66, 62, 71, 68, 74, 70, 79, 84];

export const dashboardKpis = [
  { label: 'Total Trips', value: '1,248', delta: '+12%', tone: 'success' as const },
  { label: 'On-time rate', value: '93.4%', delta: '+1.8 pts', tone: 'success' as const },
  { label: 'Students transported', value: '38,912', delta: '+6%', tone: 'success' as const },
  { label: 'Cancelled trips', value: '17', delta: '+5', tone: 'danger' as const },
];

export const vizIcons: Record<VizType, string> = {
  table: 'table_chart',
  bar: 'bar_chart',
  line: 'show_chart',
  pie: 'pie_chart',
  map: 'place',
  kpi: 'check_box',
};

export const vizLabels: Record<VizType, string> = {
  table: 'Table',
  bar: 'Bar',
  line: 'Line',
  pie: 'Pie',
  map: 'Map',
  kpi: 'KPI',
};

export const fieldIcons: Record<FieldType, string> = {
  date: 'calendar_today',
  text: 'title',
  number: 'tag',
  bool: 'toggle_on',
};

export const statusTone: Record<TripStatus, 'success' | 'warning' | 'danger'> = {
  Completed: 'success',
  Delayed: 'warning',
  Cancelled: 'danger',
};
