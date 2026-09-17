<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import draggable from 'vuedraggable';

import AppBadge from '@/components/AppBadge.vue';
import BarChart from '@/components/BarChart.vue';
import BuilderLayout from '@/layouts/BuilderLayout.vue';
import LineChart from '@/components/LineChart.vue';
import VizThumb from '@/components/VizThumb.vue';
import {
  collections,
  fieldIcons,
  reports,
  statusTone,
  tripFields,
  tripRows,
  tripsOverTime,
  tripsPerRoute,
  vizIcons,
  type Field,
  type VizType,
} from '@/data/mock';

const route = useRoute();
const isNew = computed(() => route.params.id === 'new');

const existing = computed(() => reports.find((r) => r.id === route.params.id));

const reportName = ref(existing.value?.name ?? 'Untitled report');
const renaming = ref(false);
const collection = ref<string | null>(isNew.value ? null : (existing.value?.collection ?? 'trips'));
const vizType = ref<VizType>(existing.value?.viz ?? 'table');
const fields = ref<Field[]>(tripFields.map((f) => ({ ...f })));
const fieldSearch = ref('');
const loadingSample = ref(false);
const dirty = ref(!isNew.value);
const sortBy = ref('trip_date');
const sortDir = ref<'asc' | 'desc'>('desc');
const dimension = ref('route.name');
const measure = ref('student_count');
const aggregation = ref('Sum');

const vizOptions: { type: VizType; label: string; disabled?: boolean }[] = [
  { type: 'table', label: 'Table' },
  { type: 'bar', label: 'Bar' },
  { type: 'line', label: 'Line' },
  { type: 'pie', label: 'Pie' },
  { type: 'map', label: 'Map', disabled: true },
  { type: 'kpi', label: 'KPI Card' },
];

const selectedFields = computed(() => fields.value.filter((f) => f.selected));

const visibleFields = computed(() =>
  fields.value.filter((f) => f.name.toLowerCase().includes(fieldSearch.value.trim().toLowerCase())),
);

const columns = ref<string[]>(selectedFields.value.map((f) => f.name));

// Column order is user-owned once dragged, so only reconcile membership.
watch(selectedFields, (next) => {
  const names = next.map((f) => f.name);
  columns.value = [
    ...columns.value.filter((c) => names.includes(c)),
    ...names.filter((n) => !columns.value.includes(n)),
  ];
});

watch(collection, (next) => {
  if (!next) return;
  loadingSample.value = true;
  window.setTimeout(() => {
    loadingSample.value = false;
  }, 900);
});

const groupedRows = computed(() =>
  tripsPerRoute.map((r) => ({ label: r.fullLabel, value: r.students })),
);

function toggleField(field: Field) {
  field.selected = !field.selected;
  dirty.value = true;
}

// Widths come from the design; anything else shares the remaining space.
const columnWidths: Record<string, number> = {
  trip_date: 130,
  'driver.name': 160,
  status: 120,
  student_count: 130,
};

function cellStyle(column: string) {
  const width = columnWidths[column];
  return width ? { flex: `0 0 ${width}px` } : { flex: '1 1 0', minWidth: '0' };
}

const isNumeric = (column: string) =>
  fields.value.find((f) => f.name === column)?.type === 'number';

const cellValue = (row: (typeof tripRows)[number], column: string) => {
  switch (column) {
    case 'trip_date':
      return row.tripDate;
    case 'route.name':
      return row.routeName;
    case 'driver.name':
      return row.driverName;
    case 'student_count':
      return row.studentCount;
    default:
      return '—';
  }
};
</script>

<template>
  <BuilderLayout :bar-height="52">
    <template #topbar>
      <q-btn flat dense round icon="arrow_back" size="sm" color="dark" to="/reports" />

      <div class="topbar__name" :class="{ 'topbar__name--editing': renaming }">
        <input
          v-if="renaming"
          v-model="reportName"
          class="topbar__name-input"
          autofocus
          @blur="renaming = false"
          @keyup.enter="renaming = false"
        />
        <template v-else>
          <span>{{ reportName }}</span>
          <q-icon name="edit" size="12px" @click="renaming = true" />
        </template>
      </div>

      <AppBadge v-if="dirty" tone="warning">Unsaved changes</AppBadge>
      <q-space />

      <span v-if="collection" class="topbar__meta">{{ collection }} · 1,248 records</span>

      <q-btn-dropdown
        outline
        no-caps
        class="rb-btn topbar__export"
        :disable="!collection"
        icon="download"
        label="Export"
      >
        <q-list dense>
          <q-item v-for="f in ['CSV', 'PDF', 'PNG']" :key="f" v-close-popup clickable>
            <q-item-section>{{ f }}</q-item-section>
            <q-item-section side>.{{ f.toLowerCase() }}</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-btn unelevated class="rb-btn" color="primary" label="Save" :disable="!collection" />
    </template>

    <!-- Left: collection + fields -->
    <aside class="panel panel--left">
      <div class="field">
        <label class="field__label">1 · Collection</label>
        <q-select
          v-model="collection"
          dense
          outlined
          emit-value
          map-options
          class="rb-input"
          placeholder="Select a collection…"
          :options="collections.map((c) => ({ label: c.name, value: c.name, caption: c.docs }))"
        >
          <template #prepend>
            <q-icon name="storage" size="14px" />
          </template>
          <template #option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon name="storage" size="14px" />
              </q-item-section>
              <q-item-section>{{ scope.opt.label }}</q-item-section>
              <q-item-section side>{{ scope.opt.caption }}</q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <div v-if="collection" class="field">
        <div class="field__head">
          <span class="rb-section-label">2 · Fields</span>
          <q-space />
          <span class="field__hint"
            >{{ selectedFields.length }} of {{ fields.length }} selected</span
          >
        </div>

        <q-input v-model="fieldSearch" dense outlined class="rb-input" placeholder="Search fields…">
          <template #prepend>
            <q-icon name="search" size="14px" />
          </template>
        </q-input>

        <template v-if="loadingSample">
          <div v-for="i in 9" :key="i" class="skeleton skeleton--field" />
        </template>

        <button
          v-for="f in visibleFields"
          v-else
          :key="f.name"
          type="button"
          class="field-row"
          :class="{ 'field-row--on': f.selected }"
          @click="toggleField(f)"
        >
          <span class="field-row__box" :class="{ 'field-row__box--on': f.selected }">
            <q-icon v-if="f.selected" name="check" size="11px" color="white" />
          </span>
          <q-icon :name="fieldIcons[f.type]" size="14px" />
          <span class="field-row__name">{{ f.name }}</span>
          <AppBadge v-if="f.coverage" tone="warning">{{ f.coverage }}</AppBadge>
        </button>
      </div>
    </aside>

    <!-- Center: live preview -->
    <section class="preview">
      <div class="preview__card">
        <header class="preview__head">
          <span class="preview__title">Live preview</span>
          <AppBadge v-if="collection && !loadingSample">Auto-refresh on</AppBadge>
          <q-space />
          <span v-if="loadingSample" class="preview__meta">Loading sample…</span>
          <template v-else-if="collection">
            <span v-if="vizType === 'table'" class="preview__meta">
              1,248 rows · preview limited to 100 rows
            </span>
            <span v-else class="preview__meta">
              {{ groupedRows.length }} groups · based on 1,248 rows
            </span>
            <q-icon name="refresh" size="14px" class="preview__refresh" />
          </template>
        </header>

        <!-- Empty -->
        <div v-if="!collection" class="preview__empty">
          <div class="preview__empty-tiles">
            <span
              v-for="t in ['table', 'bar', 'line'] as VizType[]"
              :key="t"
              class="preview__tile"
              :class="{ 'preview__tile--on': t === 'bar' }"
            >
              <q-icon :name="vizIcons[t]" size="20px" />
            </span>
          </div>
          <p class="preview__empty-title">Pick a collection to get started</p>
          <p class="preview__empty-text">
            Choose a collection on the left, tick the fields you need,<br />
            and your report renders here as you go.
          </p>
          <div class="preview__steps">
            <span v-for="(s, i) in ['Collection', 'Fields', 'Visualize']" :key="s">
              <span class="preview__step-num">{{ i + 1 }}</span> {{ s }}
            </span>
          </div>
        </div>

        <!-- Loading -->
        <div v-else-if="loadingSample" class="preview__loading">
          <div v-for="i in 12" :key="i" class="preview__loading-row">
            <span v-for="c in 5" :key="c" class="skeleton" />
          </div>
        </div>

        <!-- Table -->
        <div v-else-if="vizType === 'table'" class="table">
          <div class="table__row table__row--head">
            <span
              v-for="c in columns"
              :key="c"
              class="table__cell"
              :class="{ 'table__cell--num': isNumeric(c) }"
              :style="cellStyle(c)"
            >
              {{ c }}
              <q-icon
                v-if="c === sortBy"
                :name="sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'"
                size="12px"
              />
            </span>
          </div>
          <div v-for="(row, i) in tripRows" :key="i" class="table__row">
            <span
              v-for="c in columns"
              :key="c"
              class="table__cell"
              :class="{ 'table__cell--num': isNumeric(c) }"
              :style="cellStyle(c)"
            >
              <AppBadge v-if="c === 'status'" :tone="statusTone[row.status]">{{
                row.status
              }}</AppBadge>
              <template v-else>{{ cellValue(row, c) }}</template>
            </span>
          </div>
        </div>

        <!-- Chart / KPI -->
        <div v-else class="chart">
          <p class="chart__title">{{ aggregation }} of {{ measure }} by {{ dimension }}</p>
          <p class="chart__subtitle">Sep 1 – Sep 17, 2026 · 2 filters applied</p>

          <BarChart v-if="vizType === 'bar'" :data="groupedRows" :highlight="1" />
          <LineChart
            v-else-if="vizType === 'line'"
            :values="tripsOverTime"
            :labels="['Sep 1', 'Sep 5', 'Sep 9', 'Sep 13', 'Sep 17']"
          />
          <div v-else class="chart__center">
            <VizThumb :type="vizType" :width="vizType === 'pie' ? 220 : 420" :height="220" />
          </div>
        </div>
      </div>
    </section>

    <!-- Right: configuration -->
    <aside class="panel panel--right">
      <div class="field">
        <span class="rb-section-label">Visualization</span>
        <div class="viz-grid">
          <button
            v-for="o in vizOptions"
            :key="o.type"
            type="button"
            class="viz-grid__item"
            :class="{
              'viz-grid__item--on': vizType === o.type,
              'viz-grid__item--off': o.disabled,
            }"
            :disabled="o.disabled"
            @click="vizType = o.type"
          >
            <q-icon :name="vizIcons[o.type]" size="18px" />
            {{ o.label }}
            <q-tooltip v-if="o.disabled">No location field detected</q-tooltip>
          </button>
        </div>
      </div>

      <p v-if="!collection" class="panel__hint">
        Configuration options appear once fields are selected.
      </p>

      <template v-else-if="vizType === 'table'">
        <div class="field">
          <div class="field__head">
            <span class="rb-section-label">Columns</span>
            <q-space />
            <span class="field__hint">Drag to reorder</span>
          </div>
          <draggable v-model="columns" item-key="self" handle=".reorder-item__grip" class="columns">
            <template #item="{ element }">
              <div class="reorder-item">
                <q-icon class="reorder-item__grip" name="drag_indicator" size="14px" />
                <span>{{ element }}</span>
              </div>
            </template>
          </draggable>
        </div>

        <div class="sort">
          <div class="field sort__by">
            <label class="field__label">Sort by</label>
            <q-select v-model="sortBy" dense outlined class="rb-input" :options="columns" />
          </div>
          <div class="segmented">
            <button type="button" :class="{ 'is-on': sortDir === 'asc' }" @click="sortDir = 'asc'">
              Asc
            </button>
            <button
              type="button"
              :class="{ 'is-on': sortDir === 'desc' }"
              @click="sortDir = 'desc'"
            >
              Desc
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="field">
          <label class="field__label">Dimension</label>
          <q-select
            v-model="dimension"
            dense
            outlined
            class="rb-input"
            :options="fields.filter((f) => f.type !== 'number').map((f) => f.name)"
          />
          <span class="field__hint">Groupable fields only (text, date, boolean)</span>
        </div>

        <div class="field">
          <label class="field__label">Measure</label>
          <q-select
            v-model="measure"
            dense
            outlined
            class="rb-input"
            :options="fields.filter((f) => f.type === 'number').map((f) => f.name)"
          />
          <span class="field__hint">Numeric fields or "Count of records"</span>
        </div>

        <div class="field">
          <label class="field__label">Aggregation</label>
          <div class="segmented segmented--wide">
            <button
              v-for="a in ['Sum', 'Avg', 'Min', 'Max', 'Count']"
              :key="a"
              type="button"
              :class="{ 'is-on': aggregation === a }"
              @click="aggregation = a"
            >
              {{ a }}
            </button>
          </div>
        </div>
      </template>

      <div v-if="collection" class="field">
        <div class="field__head">
          <span class="rb-section-label">Filters</span>
          <q-space />
          <AppBadge tone="brand">2</AppBadge>
        </div>

        <div class="filter">
          <div class="filter__head">
            <q-icon name="calendar_today" size="13px" />
            <span class="filter__name">trip_date</span>
            <q-space />
            <q-icon name="close" size="13px" class="filter__remove" />
          </div>
          <div class="filter__control">
            <q-icon name="calendar_today" size="14px" />
            Sep 1, 2026 &nbsp;→&nbsp; Sep 17, 2026
          </div>
        </div>

        <div class="filter">
          <div class="filter__head">
            <q-icon name="title" size="13px" />
            <span class="filter__name">status</span>
            <q-space />
            <q-icon name="close" size="13px" class="filter__remove" />
          </div>
          <div class="filter__control filter__control--tags">
            <span v-for="t in ['Completed', 'Delayed']" :key="t" class="tag">
              {{ t }}
              <q-icon name="close" size="10px" />
            </span>
            <q-space />
            <q-icon name="expand_more" size="14px" />
          </div>
        </div>

        <button type="button" class="filter__add">
          <q-icon name="add" size="13px" />
          Add filter
        </button>
      </div>
    </aside>
  </BuilderLayout>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.topbar {
  &__name {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 30px;
    padding: 0 8px;
    border-radius: $radius-sm;
    font-size: 14px;
    font-weight: 500;
    color: $text;
    cursor: text;

    &:hover {
      background: $surface-muted;
    }

    &--editing {
      border: 1px solid $brand;
      background: $surface;
    }
  }

  &__name-input {
    border: 0;
    outline: none;
    background: transparent;
    font: inherit;
    color: inherit;
  }

  &__meta {
    font-size: 12px;
    color: $text-muted;
  }

  &__export :deep(.q-btn__content) {
    font-size: 13px;
    color: $text;
  }
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
  padding: 16px;
  overflow-y: auto;
  background: $surface;

  &--left {
    width: $panel-left-width;
    border-right: 1px solid $border;
  }

  &--right {
    width: $panel-right-width;
    border-left: 1px solid $border;
  }

  &__hint {
    margin: 0;
    padding: 12px;
    border: 1px solid $border;
    border-radius: $radius-md;
    background: $surface-subtle;
    font-size: 12px;
    color: $text-muted;
  }

  @media (max-width: 1023px) {
    display: none;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__label {
    font-size: 12px;
    font-weight: 500;
    color: $text-soft;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__hint {
    font-size: 11px;
    color: $text-muted;
  }
}

.field-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 8px;
  border: 0;
  border-radius: $radius-sm;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  color: $text-soft;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: $surface-muted;
  }

  &--on {
    color: $text;
  }

  &__box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    border: 1px solid $border-strong;
    border-radius: $radius-xs;
    background: $surface;

    &--on {
      border-color: $brand;
      background: $brand;
    }
  }

  &__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.preview {
  display: flex;
  flex: 1;
  min-width: 0;
  padding: 24px;
  background: $surface-subtle;

  @media (max-width: 1023px) {
    padding: 16px;
  }

  &__card {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    background: $surface;
    border: 1px solid $border;
    border-radius: $radius-lg;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 48px;
    flex-shrink: 0;
    padding: 0 16px;
    border-bottom: 1px solid $border;
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: $text;
  }

  &__meta {
    font-size: 12px;
    color: $text-muted;
  }

  &__refresh {
    color: $text-muted;
    cursor: pointer;
  }

  &__empty {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px;
    text-align: center;
  }

  &__empty-tiles {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__tile {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 48px;
    border: 1px solid $border;
    border-radius: $radius-md;
    color: $text-muted;

    &--on {
      border-color: $brand-border;
      background: $brand-soft;
      color: $brand;
    }
  }

  &__empty-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: $text;
  }

  &__empty-text {
    margin: 0;
    font-size: 12px;
    color: $text-muted;
  }

  &__steps {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    font-size: 11px;
    color: $text-soft;
  }

  &__step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: $radius-pill;
    background: $surface-muted;
    font-size: 9px;
    color: $text-muted;
  }

  &__loading {
    display: flex;
    flex-direction: column;
  }

  &__loading-row {
    display: flex;
    gap: 24px;
    padding: 12px 16px;
    border-bottom: 1px solid $border;

    .skeleton {
      flex: 1;
      height: 8px;
    }
  }
}

.skeleton {
  border-radius: $radius-xs;
  background: linear-gradient(90deg, #f1f1f4 25%, #e9e9ee 50%, #f1f1f4 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;

  &--field {
    height: 12px;
    margin: 9px 8px;
  }
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}

.table {
  overflow: auto;

  &__row {
    display: flex;
    border-bottom: 1px solid $border;

    &--head {
      position: sticky;
      top: 0;
      background: $surface-subtle;

      .table__cell {
        height: 36px;
        font-size: 12px;
        font-weight: 500;
        color: $text-soft;
      }
    }

    &:not(.table__row--head):hover {
      background: $surface-subtle;
    }
  }

  &__cell {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 38px;
    padding: 0 16px;
    overflow: hidden;
    font-size: 13px;
    color: $text;
    white-space: nowrap;
    text-overflow: ellipsis;

    &--num {
      justify-content: flex-end;
    }

    &:first-child {
      color: $text-soft;
    }
  }
}

.chart {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 16px;

  &__title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: $text;
  }

  &__subtitle {
    margin: 2px 0 16px;
    font-size: 12px;
    color: $text-muted;
  }

  &__center {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }
}

.viz-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 60px;
    border: 1px solid $border;
    border-radius: 8px;
    background: $surface;
    font-family: inherit;
    font-size: 11px;
    color: $text-soft;
    cursor: pointer;

    &:hover:not(&--off) {
      border-color: $border-strong;
    }

    &--on {
      border-color: $brand-border;
      background: $brand-soft;
      color: $brand;
      font-weight: 500;
    }

    &--off {
      background: $surface-muted;
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.columns {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reorder-item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid $border;
  border-radius: $radius-sm;
  background: $surface;
  font-size: 12px;
  color: $text;

  &__grip {
    color: $text-muted;
    cursor: grab;
  }

  &.sortable-chosen {
    border-color: $brand;
    box-shadow: $shadow-drag;
  }
}

.sort {
  display: flex;
  align-items: flex-end;
  gap: 8px;

  &__by {
    flex: 1;
    min-width: 0;
  }
}

.segmented {
  display: flex;
  overflow: hidden;
  border: 1px solid $border-strong;
  border-radius: $radius-md;

  button {
    height: 32px;
    padding: 0 10px;
    border: 0;
    background: $surface;
    font-family: inherit;
    font-size: 12px;
    color: $text-muted;
    cursor: pointer;

    &.is-on {
      background: $surface-muted;
      color: $text;
      font-weight: 500;
    }
  }

  &--wide button {
    flex: 1;
  }
}

.filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid $border;
  border-radius: 8px;
  background: $surface;

  &__head {
    display: flex;
    align-items: center;
    gap: 6px;
    color: $text-soft;
  }

  &__name {
    font-size: 12px;
    font-weight: 500;
    color: $text;
  }

  &__remove {
    cursor: pointer;
  }

  &__control {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 32px;
    padding: 0 10px;
    border: 1px solid $border-strong;
    border-radius: $radius-md;
    font-size: 12px;
    color: $text;

    &--tags {
      gap: 4px;
      padding: 0 6px;
    }
  }

  &__add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 32px;
    border: 1px solid $border-strong;
    border-radius: $radius-md;
    background: transparent;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    color: $text-soft;
    cursor: pointer;

    &:hover {
      background: $surface-subtle;
    }
  }
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: $radius-xs;
  background: $surface-muted;
  font-size: 11px;
  font-weight: 500;
  color: $text-soft;
}
</style>
