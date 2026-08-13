<template>
  <q-item v-ripple tag="label" clickable dense>
    <q-item-section avatar top>
      <q-checkbox :model-value="isSelected" dense @update:model-value="store.toggleColumn(column.name)" />
    </q-item-section>

    <q-item-section avatar top style="min-width: 28px">
      <q-icon :name="typeIcon(column.type)" size="18px" color="grey-7">
        <q-tooltip>{{ column.type }}</q-tooltip>
      </q-icon>
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ column.label }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CatalogColumn } from '@/types/catalog';
import { useDefinitionStore } from '@/stores/definition';
import { typeIcon } from '@/utils/typeIcons';

const props = defineProps<{ column: CatalogColumn }>();
const store = useDefinitionStore();

const isSelected = computed(() => store.report.columns.includes(props.column.name));

const caption = computed(() => {
  const c = props.column;
  const parts: string[] = [];
  if (c.type === 'string' && c.cardinality !== undefined) {
    parts.push(`${c.cardinality} distinct`);
  } else if (c.type === 'number' && c.stats) {
    parts.push(`${c.stats.min} – ${c.stats.max}`);
  } else if ((c.type === 'date' || c.type === 'timestamp') && c.stats?.min !== undefined && c.stats?.max !== undefined) {
    const min = new Date(c.stats.min).toLocaleDateString();
    const max = new Date(c.stats.max).toLocaleDateString();
    parts.push(`${min} – ${max}`);
  }
  if (c.nullable) parts.push('nullable');
  return parts.join(' · ');
});
</script>
