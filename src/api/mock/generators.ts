import { Rng } from './prng';
import {
  ROUTE_NAMES,
  SCHOOL_NAMES,
  GRADES,
  makeNameList,
  makeStopNames,
  makeVehiclePlates,
  pad,
} from './shared';

// Shared reference data so foreign-key-like columns are coherent across datasets.
const refRng = new Rng(1);
export const DRIVER_NAMES = makeNameList(25, refRng);
export const STOP_NAMES = makeStopNames(60, refRng);
export const VEHICLE_PLATES = makeVehiclePlates(30, refRng);

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function skewedTimeOfDay(rng: Rng): { h: number; m: number } {
  // morning peak ~07:00-08:30, afternoon peak ~14:00-15:30, else spread 06:00-18:00
  const bucket = rng.pickWeighted<'morning' | 'afternoon' | 'other'>([
    ['morning', 0.4],
    ['afternoon', 0.4],
    ['other', 0.2],
  ]);
  if (bucket === 'morning') return { h: rng.int(6, 8), m: rng.int(0, 59) };
  if (bucket === 'afternoon') return { h: rng.int(13, 15), m: rng.int(0, 59) };
  return { h: rng.int(6, 18), m: rng.int(0, 59) };
}

function weekdaySkewedDaysAgo(rng: Rng, maxDays: number): Date {
  for (let attempt = 0; attempt < 20; attempt++) {
    const d = rng.daysAgo(maxDays);
    const day = d.getDay();
    if (day !== 5 && day !== 6) return d; // skip Fri/Sat (UAE weekend) most of the time
    if (rng.bool(0.15)) return d;
  }
  return rng.daysAgo(maxDays);
}

export interface TripRow {
  trip_id: string;
  route_name: string;
  school_name: string;
  driver_name: string;
  vehicle_plate: string;
  status: string;
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  distance_km: number;
  student_count: number | null;
  delay_minutes: number;
  is_return_trip: boolean;
  start_lat: number;
  start_lng: number;
}

export function generateTrips(): TripRow[] {
  const rng = new Rng(101);
  const rows: TripRow[] = [];
  for (let i = 1; i <= 2000; i++) {
    const day = weekdaySkewedDaysAgo(rng, 120);
    const { h, m } = skewedTimeOfDay(rng);
    const started = new Date(day);
    started.setHours(h, m, 0, 0);

    const duration = rng.int(15, 95);
    const ended = new Date(started.getTime() + duration * 60000);

    const status = rng.pickWeighted<string>([
      ['Completed', 0.78],
      ['Delayed', 0.14],
      ['Cancelled', 0.05],
      ['In Progress', 0.03],
    ]);
    const delay = status === 'Delayed' ? rng.int(5, 60) : 0;

    rows.push({
      trip_id: `TRP-${pad(i, 5)}`,
      route_name: rng.pick(ROUTE_NAMES),
      school_name: rng.pick(SCHOOL_NAMES),
      driver_name: rng.pick(DRIVER_NAMES),
      vehicle_plate: rng.pick(VEHICLE_PLATES),
      status,
      started_at: started.toISOString(),
      ended_at: ended.toISOString(),
      duration_minutes: duration,
      distance_km: Math.round(rng.float(3.2, 41.8) * 10) / 10,
      student_count: rng.bool(0.02) ? null : rng.int(0, 62),
      delay_minutes: delay,
      is_return_trip: rng.bool(0.48),
      start_lat: Math.round(rng.float(24.3, 24.6) * 10000) / 10000,
      start_lng: Math.round(rng.float(54.3, 54.7) * 10000) / 10000,
    });
  }
  return rows;
}

export interface RouteRow {
  route_id: string;
  route_name: string;
  zone: string;
  school_name: string;
  stop_count: number;
  distance_km: number;
  estimated_duration_minutes: number;
  active: boolean;
  created_at: string;
}

export function generateRoutes(): RouteRow[] {
  const rng = new Rng(102);
  const zones = ['Zone A - Al Reem', 'Zone B - Khalifa City', 'Zone C - Al Raha', 'Zone D - Mussafah'];
  return ROUTE_NAMES.map((name, idx) => ({
    route_id: `RTE-${pad(idx + 1, 3)}`,
    route_name: name,
    zone: rng.pick(zones),
    school_name: rng.pick(SCHOOL_NAMES),
    stop_count: rng.int(4, 18),
    distance_km: Math.round(rng.float(6, 38) * 10) / 10,
    estimated_duration_minutes: rng.int(20, 75),
    active: rng.bool(0.9),
    created_at: isoDate(rng.daysAgo(700)),
  }));
}

export interface StudentRow {
  student_id: string;
  full_name: string;
  grade: string;
  school_name: string;
  route_name: string;
  stop_name: string;
  enrolled_at: string;
  active: boolean;
}

export function generateStudents(): StudentRow[] {
  const rng = new Rng(103);
  const names = makeNameList(800, rng);
  return names.map((name, idx) => ({
    student_id: `STU-${pad(idx + 1, 4)}`,
    full_name: name,
    grade: rng.pick(GRADES),
    school_name: rng.pick(SCHOOL_NAMES),
    route_name: rng.pick(ROUTE_NAMES),
    stop_name: rng.pick(STOP_NAMES),
    enrolled_at: isoDate(rng.daysAgo(1200)),
    active: rng.bool(0.93),
  }));
}

export interface StudentTripHistoryRow {
  record_id: string;
  student_id: string;
  student_name: string;
  trip_id: string;
  route_name: string;
  stop_name: string;
  boarded_at: string;
  alighted_at: string;
  boarded: boolean;
  school_name: string;
}

export function generateStudentTripHistory(students: StudentRow[], trips: TripRow[]): StudentTripHistoryRow[] {
  const rng = new Rng(104);
  const rows: StudentTripHistoryRow[] = [];
  for (let i = 1; i <= 6000; i++) {
    const student = rng.pick(students);
    const trip = rng.pick(trips);
    const boarded = rng.bool(0.9);
    const boardedAt = new Date(trip.started_at);
    boardedAt.setMinutes(boardedAt.getMinutes() + rng.int(0, 10));
    const alightedAt = new Date(trip.ended_at);
    alightedAt.setMinutes(alightedAt.getMinutes() - rng.int(0, 5));

    rows.push({
      record_id: `SRH-${pad(i, 5)}`,
      student_id: student.student_id,
      student_name: student.full_name,
      trip_id: trip.trip_id,
      route_name: trip.route_name,
      stop_name: rng.pick(STOP_NAMES),
      boarded_at: boardedAt.toISOString(),
      alighted_at: alightedAt.toISOString(),
      boarded,
      school_name: student.school_name,
    });
  }
  return rows;
}

export interface DriverRow {
  driver_id: string;
  driver_name: string;
  license_expiry: string;
  years_experience: number;
  assigned_route: string;
  rating: number;
  active: boolean;
}

export function generateDrivers(): DriverRow[] {
  const rng = new Rng(105);
  return DRIVER_NAMES.map((name, idx) => ({
    driver_id: `DRV-${pad(idx + 1, 3)}`,
    driver_name: name,
    license_expiry: isoDate(new Date(Date.now() + rng.float(-60, 700) * 86400000)),
    years_experience: rng.int(1, 22),
    assigned_route: rng.pick(ROUTE_NAMES),
    rating: Math.round(rng.float(3.1, 5.0) * 10) / 10,
    active: rng.bool(0.92),
  }));
}
