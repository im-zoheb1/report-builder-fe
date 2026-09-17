<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';

import AppBadge from '@/components/AppBadge.vue';
import FilterChip from '@/components/FilterChip.vue';
import LibraryLayout from '@/layouts/LibraryLayout.vue';
import ReportCard from '@/components/ReportCard.vue';
import { collections, reports, vizIcons, type VizType } from '@/data/mock';

const $q = useQuasar();

const typeFilters: { label: string; value: VizType | 'all'; icon?: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Table', value: 'table', icon: vizIcons.table },
  { label: 'Chart', value: 'bar', icon: vizIcons.bar },
  { label: 'Map', value: 'map', icon: vizIcons.map },
  { label: 'KPI', value: 'kpi', icon: vizIcons.kpi },
];

const search = ref('');
const activeType = ref<VizType | 'all'>('all');
const activeCollection = ref<string | null>(null);
const view = ref<'grid' | 'list'>('grid');

// "Chart" covers every chart-shaped visualization, not just bar.
const chartTypes: VizType[] = ['bar', 'line', 'pie'];

const visibleReports = computed(() =>
  reports.filter((r) => {
    const matchesType =
      activeType.value === 'all' ||
      (activeType.value === 'bar' ? chartTypes.includes(r.viz) : r.viz === activeType.value);
    const matchesCollection = !activeCollection.value || r.collection === activeCollection.value;
    const matchesSearch = r.name.toLowerCase().includes(search.value.trim().toLowerCase());
    return matchesType && matchesCollection && matchesSearch;
  }),
);

function toggleCollection(name: string) {
  activeCollection.value = activeCollection.value === name ? null : name;
}
</script>

<template>
  <LibraryLayout>
    <q-page class="library">
      <header class="library__header">
        <div>
          <h1 class="rb-title">Reports</h1>
          <p class="rb-subtitle">
            {{ reports.length }} saved reports across {{ collections.length }} collections
          </p>
        </div>
        <q-space />

        <q-input
          v-model="search"
          dense
          outlined
          class="rb-input library__search"
          placeholder="Search reports…"
        >
          <template #prepend>
            <q-icon name="search" size="14px" />
          </template>
        </q-input>

        <div v-if="$q.screen.gt.sm" class="library__view-toggle">
          <button
            type="button"
            :class="{ 'is-active': view === 'grid' }"
            aria-label="Grid view"
            @click="view = 'grid'"
          >
            <q-icon name="grid_view" size="14px" />
          </button>
          <button
            type="button"
            :class="{ 'is-active': view === 'list' }"
            aria-label="List view"
            @click="view = 'list'"
          >
            <q-icon name="view_list" size="14px" />
          </button>
        </div>

        <q-btn
          unelevated
          class="rb-btn"
          color="primary"
          icon="add"
          label="New Report"
          to="/reports/new"
        />
      </header>

      <div class="library__filters">
        <span class="library__filter-label">Type</span>
        <FilterChip
          v-for="f in typeFilters"
          :key="f.value"
          :label="f.label"
          :icon="f.icon"
          :selected="activeType === f.value"
          @click="activeType = f.value"
        />

        <span class="library__divider" />

        <span class="library__filter-label">Collection</span>
        <FilterChip
          v-for="c in collections"
          :key="c.name"
          :label="c.name"
          :selected="activeCollection === c.name"
          @click="toggleCollection(c.name)"
        />
      </div>

      <div v-if="view === 'grid' && $q.screen.gt.sm" class="library__grid">
        <ReportCard v-for="r in visibleReports" :key="r.id" :report="r" />
      </div>

      <div v-else class="library__list">
        <router-link
          v-for="r in visibleReports"
          :key="r.id"
          :to="`/reports/${r.id}`"
          class="library__list-row"
        >
          <span class="library__list-icon">
            <q-icon :name="vizIcons[r.viz]" size="18px" />
          </span>
          <span class="library__list-text">
            <span class="library__list-name">{{ r.name }}</span>
            <span class="library__list-meta">
              <AppBadge>{{ r.collection }}</AppBadge>
              <span class="library__list-updated">{{ r.updated }}</span>
            </span>
          </span>
          <q-icon name="chevron_right" size="18px" color="grey-6" />
        </router-link>
      </div>

      <p v-if="!visibleReports.length" class="library__empty">No reports match these filters.</p>
    </q-page>
  </LibraryLayout>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.library {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px 40px;

  @media (max-width: 1023px) {
    padding: 20px 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;

    h1,
    p {
      margin: 0;
    }

    p {
      margin-top: 4px;
    }
  }

  &__search {
    width: 260px;

    @media (max-width: 1023px) {
      order: 10;
      width: 100%;
    }
  }

  &__view-toggle {
    display: flex;
    overflow: hidden;
    border: 1px solid $border-strong;
    border-radius: $radius-md;

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 32px;
      border: 0;
      background: $surface;
      color: $text-soft;
      cursor: pointer;

      &.is-active {
        background: $surface-muted;
        color: $text;
      }
    }
  }

  &__filters {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__filter-label {
    font-size: 12px;
    color: $text-muted;
  }

  &__divider {
    width: 1px;
    height: 18px;
    margin: 0 6px;
    background: $border;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 1439px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (max-width: 1100px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    border: 1px solid $border;
    border-radius: $radius-lg;
    overflow: hidden;
  }

  &__list-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: $surface;
    text-decoration: none;

    & + & {
      border-top: 1px solid $border;
    }

    &:hover {
      background: $surface-subtle;
    }
  }

  &__list-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: $radius-sm;
    background: $surface-muted;
    color: $text-soft;
  }

  &__list-text {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__list-name {
    font-size: 14px;
    font-weight: 500;
    color: $text;
  }

  &__list-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__list-updated {
    font-size: 12px;
    color: $text-muted;
  }

  &__empty {
    padding: 40px 0;
    text-align: center;
    font-size: 13px;
    color: $text-muted;
  }
}
</style>
