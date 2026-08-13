<template>
  <DataTableViz
    v-if="definition.visualization === 'table'"
    :state="state"
    :rows="rows"
    :columns="columns"
    :meta="meta"
    :error="error"
    @retry="emit('retry')"
    @clear-filters="emit('clear-filters')"
  />
</template>

<script setup lang="ts">
import type { ReportDefinition } from '@/types/report';
import type { VizProps } from '@/types/ui';
import DataTableViz from '@/components/viz/DataTableViz.vue';

// Thin dispatcher: knows nothing about builder vs. viewer context. Adding a
// second visualization type means adding a case here and a *Viz component —
// nothing else in this file changes.
defineProps<{ definition: ReportDefinition } & VizProps>();
const emit = defineEmits<{ retry: []; 'clear-filters': [] }>();
</script>
