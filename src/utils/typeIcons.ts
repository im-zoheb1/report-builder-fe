import type { ColumnType } from '@/types/catalog';

export const TYPE_ICONS: Record<ColumnType, string> = {
  string: 'abc',
  number: 'tag',
  date: 'event',
  timestamp: 'event',
  boolean: 'toggle_on',
  geo: 'place',
  unknown: 'help_outline',
};

export function typeIcon(type: ColumnType): string {
  return TYPE_ICONS[type];
}
