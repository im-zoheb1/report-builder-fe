export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  private next: () => number;

  constructor(seed: number) {
    this.next = mulberry32(seed);
  }

  float(min = 0, max = 1): number {
    return min + this.next() * (max - min);
  }

  int(min: number, max: number): number {
    return Math.floor(this.float(min, max + 1));
  }

  bool(pTrue = 0.5): boolean {
    return this.next() < pTrue;
  }

  pick<T>(arr: readonly T[]): T {
    const item = arr[this.int(0, arr.length - 1)];
    if (item === undefined) throw new Error('Rng.pick: empty array');
    return item;
  }

  pickWeighted<T>(entries: [T, number][]): T {
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = this.float(0, total);
    for (const [value, weight] of entries) {
      r -= weight;
      if (r <= 0) return value;
    }
    const last = entries[entries.length - 1];
    if (!last) throw new Error('Rng.pickWeighted: empty entries');
    return last[0];
  }

  shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      const tmp = copy[i];
      copy[i] = copy[j] as T;
      copy[j] = tmp as T;
    }
    return copy;
  }

  daysAgo(maxDays: number): Date {
    const now = Date.now();
    const ms = this.float(0, maxDays) * 86400000;
    return new Date(now - ms);
  }
}
