<template>
  <TableConfig v-if="store.report.visualization === 'table'" />
</template>

<script setup lang="ts">
import { useDefinitionStore } from '@/stores/definition';
import TableConfig from '@/components/builder/TableConfig.vue';

const store = useDefinitionStore();
</script>
