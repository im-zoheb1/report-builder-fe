export const ZONES = ['Zone A - Al Reem', 'Zone B - Khalifa City', 'Zone C - Al Raha', 'Zone D - Mussafah'] as const;

export const ROUTE_NAMES = [
  'Route 1 - Corniche Express',
  'Route 2 - Al Bateen Circuit',
  'Route 3 - Yas Island Link',
  'Route 4 - Saadiyat Shuttle',
  'Route 5 - Khalidiya Loop',
  'Route 6 - Mussafah Industrial',
  'Route 7 - Al Raha Beach',
  'Route 8 - Khalifa City West',
  'Route 9 - Al Shamkha',
  'Route 10 - Baniyas East',
  'Route 11 - Al Reef Downs',
  'Route 12 - Al Reem Loop',
] as const;

export const SCHOOL_NAMES = [
  'Abu Dhabi International School',
  'Al Reem British Academy',
  'Corniche American School',
  'Saadiyat Grammar School',
  'Khalifa City Community School',
] as const;

const FIRST_NAMES = [
  'Ahmed',
  'Mohammed',
  'Fatima',
  'Aisha',
  'Khalid',
  'Sara',
  'Omar',
  'Layla',
  'Hassan',
  'Mariam',
  'Youssef',
  'Noura',
  'Rashid',
  'Huda',
  'Saeed',
  'Amal',
  'Tariq',
  'Reem',
  'Faisal',
  'Salma',
  'Adel',
  'Dana',
  'Karim',
  'Lina',
  'Nasser',
];

const LAST_NAMES = [
  'Al Mansoori',
  'Al Nuaimi',
  'Al Suwaidi',
  'Al Shamsi',
  'Al Zaabi',
  'Al Marzooqi',
  'Al Hameli',
  'Al Kaabi',
  'Al Dhaheri',
  'Al Falasi',
];

export function makeFullName(rng: { pick: <T>(arr: readonly T[]) => T }): string {
  return `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
}

export function makeNameList(count: number, rng: { pick: <T>(arr: readonly T[]) => T }): string[] {
  const names = new Set<string>();
  while (names.size < count) {
    names.add(makeFullName(rng));
  }
  return Array.from(names);
}

export const GRADES = [
  'KG1',
  'KG2',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
] as const;

export function makeStopNames(count: number, rng: { pick: <T>(arr: readonly T[]) => T } & { int: (min: number, max: number) => number }): string[] {
  const streets = [
    'Corniche',
    'Hamdan',
    'Khalifa',
    'Najda',
    'Muroor',
    'Airport',
    'Salam',
    'Bainunah',
    'Karama',
    'Delma',
    'Electra',
    'Zayed',
  ];
  const suffixes = ['St', 'Ave', 'Rd', 'Blvd'];
  const stops = new Set<string>();
  while (stops.size < count) {
    stops.add(`${rng.pick(streets)} ${rng.pick(suffixes)} Stop ${rng.int(1, 9)}`);
  }
  return Array.from(stops);
}

export function makeVehiclePlates(count: number, rng: { int: (min: number, max: number) => number }): string[] {
  const plates = new Set<string>();
  while (plates.size < count) {
    plates.add(`AD-${rng.int(1, 50)}-${rng.int(10000, 99999)}`);
  }
  return Array.from(plates);
}

export function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}
