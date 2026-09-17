<script lang="ts" setup>
import { computed, ref } from 'vue';

import FilterChip from '@/components/FilterChip.vue';
import VizThumb from '@/components/VizThumb.vue';
import { reports, vizIcons, type VizType } from '@/data/mock';

const props = defineProps<{ modelValue: boolean; addedIds: string[] }>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  add: [ids: string[]];
}>();

const search = ref('');
const category = ref<'all' | 'charts' | 'tables' | 'kpis'>('all');
const selected = ref<string[]>([]);

const categories = [
  { label: 'All', value: 'all' as const },
  { label: 'Charts', value: 'charts' as const },
  { label: 'Tables', value: 'tables' as const },
  { label: 'KPIs', value: 'kpis' as const },
];

const categoryTypes: Record<string, VizType[]> = {
  charts: ['bar', 'line', 'pie'],
  tables: ['table'],
  kpis: ['kpi'],
};

const visible = computed(() =>
  reports.filter((r) => {
    const types = categoryTypes[category.value];
    const matchesCategory = !types || types.includes(r.viz);
    return matchesCategory && r.name.toLowerCase().includes(search.value.trim().toLowerCase());
  }),
);

function toggle(id: string) {
  if (props.addedIds.includes(id)) return;
  selected.value = selected.value.includes(id)
    ? selected.value.filter((s) => s !== id)
    : [...selected.value, id];
}

function confirm() {
  emit('add', selected.value);
  selected.value = [];
  emit('update:modelValue', false);
}
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <div class="modal">
      <header class="modal__head">
        <span class="modal__title">Add card</span>
        <q-space />
        <q-btn v-close-popup flat dense round icon="close" size="sm" color="dark" />
      </header>

      <div class="modal__body">
        <div class="modal__filters">
          <q-input
            v-model="search"
            dense
            outlined
            class="rb-input modal__search"
            placeholder="Search saved reports…"
          >
            <template #prepend>
              <q-icon name="search" size="14px" />
            </template>
          </q-input>
          <FilterChip
            v-for="c in categories"
            :key="c.value"
            :label="c.label"
            :selected="category === c.value"
            @click="category = c.value"
          />
        </div>

        <div class="modal__grid">
          <button
            v-for="r in visible"
            :key="r.id"
            type="button"
            class="tile"
            :class="{
              'tile--added': addedIds.includes(r.id),
              'tile--selected': selected.includes(r.id),
            }"
            :disabled="addedIds.includes(r.id)"
            @click="toggle(r.id)"
          >
            <span class="tile__thumb">
              <VizThumb :type="r.viz" :width="r.viz === 'pie' ? 64 : 150" :height="64" />
            </span>
            <span class="tile__body">
              <span class="tile__name">{{ r.name }}</span>
              <span class="tile__meta">
                <q-icon :name="vizIcons[r.viz]" size="12px" />
                {{ r.collection }}
                <q-space />
                <span v-if="addedIds.includes(r.id)" class="tile__added">Added</span>
                <span v-else-if="selected.includes(r.id)" class="tile__check">
                  <q-icon name="check" size="10px" color="white" />
                </span>
              </span>
            </span>
          </button>
        </div>
      </div>

      <footer class="modal__foot">
        <span class="modal__hint">
          {{ selected.length }} report{{ selected.length === 1 ? '' : 's' }} selected
          <template v-if="selected.length">· will be added as a 4-column card</template>
        </span>
        <q-space />
        <q-btn v-close-popup outline no-caps class="rb-btn" label="Cancel" color="dark" />
        <q-btn
          unelevated
          no-caps
          class="rb-btn"
          color="primary"
          label="Add to dashboard"
          :disable="!selected.length"
          @click="confirm"
        />
      </footer>
    </div>
  </q-dialog>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.modal {
  display: flex;
  flex-direction: column;
  width: 720px;
  max-width: 96vw;
  overflow: hidden;
  background: $surface;
  border: 1px solid $border;
  border-radius: $radius-xl;
  box-shadow: $shadow-modal;

  &__head {
    display: flex;
    align-items: center;
    height: 56px;
    flex-shrink: 0;
    padding: 0 20px;
    border-bottom: 1px solid $border;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: $text;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    overflow-y: auto;
  }

  &__filters {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__search {
    flex: 1;
    min-width: 200px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 700px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__foot {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 60px;
    flex-shrink: 0;
    padding: 0 20px;
    background: $surface-subtle;
    border-top: 1px solid $border;
  }

  &__hint {
    font-size: 12px;
    color: $text-muted;
  }
}

.tile {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  border: 1px solid $border;
  border-radius: 9px;
  background: $surface;
  font-family: inherit;
  cursor: pointer;
  text-align: left;

  &:hover:not(&--added) {
    border-color: $border-strong;
  }

  &--added {
    opacity: 0.55;
    cursor: default;
  }

  &--selected {
    border: 1.5px solid $brand;
  }

  &__thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88px;
    background: $surface-subtle;
    border-bottom: 1px solid $border;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
  }

  &__name {
    font-size: 12px;
    font-weight: 500;
    color: $text;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: $text-muted;
  }

  &__added {
    font-size: 11px;
  }

  &__check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: $radius-pill;
    background: $brand;
  }
}
</style>
