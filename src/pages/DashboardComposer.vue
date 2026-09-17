<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import draggable from 'vuedraggable';

import AddCardDialog from '@/components/AddCardDialog.vue';
import AppBadge from '@/components/AppBadge.vue';
import BarChart from '@/components/BarChart.vue';
import BuilderLayout from '@/layouts/BuilderLayout.vue';
import LineChart from '@/components/LineChart.vue';
import VizThumb from '@/components/VizThumb.vue';
import {
  dashboardKpis,
  dashboards,
  reports,
  statusTone,
  tripRows,
  tripsOverTime,
  tripsPerRoute,
  type VizType,
} from '@/data/mock';

interface CardModel {
  id: string;
  title: string;
  subtitle: string;
  viz: VizType;
  span: 'half' | 'wide';
}

const route = useRoute();

const dashboard = computed(() => dashboards.find((d) => d.id === route.params.id));
const title = ref(dashboard.value?.name ?? 'Untitled dashboard');

const cards = ref<CardModel[]>([
  {
    id: 'trips-per-route',
    title: 'Trips per route',
    subtitle: 'Count of records',
    viz: 'bar',
    span: 'half',
  },
  { id: 'trips-over-time', title: 'Trips over time', subtitle: 'Daily', viz: 'line', span: 'half' },
  { id: 'daily-trips-overview', title: 'Recent trips', subtitle: '', viz: 'table', span: 'wide' },
  { id: 'live-route-map', title: 'Live route map', subtitle: 'routes', viz: 'map', span: 'half' },
]);

const addOpen = ref(false);
const addedIds = computed(() => cards.value.map((c) => c.id));

const barData = computed(() => tripsPerRoute.map((r) => ({ label: r.label, value: r.value })));

function addCards(ids: string[]) {
  for (const id of ids) {
    const report = reports.find((r) => r.id === id);
    if (!report) continue;
    cards.value.push({
      id: report.id,
      title: report.name,
      subtitle: report.collection,
      viz: report.viz,
      span: 'half',
    });
  }
}

function removeCard(id: string) {
  cards.value = cards.value.filter((c) => c.id !== id);
}
</script>

<template>
  <BuilderLayout tinted :bar-height="56">
    <template #topbar>
      <q-btn flat dense round icon="arrow_back" size="sm" color="dark" to="/dashboards" />
      <span class="composer__title">{{ title }}</span>
      <AppBadge tone="brand">Editing</AppBadge>
      <q-space />

      <button type="button" class="composer__range">
        <q-icon name="calendar_today" size="14px" />
        Sep 1 – Sep 17, 2026
        <q-icon name="expand_more" size="14px" />
      </button>

      <q-btn
        outline
        no-caps
        class="rb-btn"
        color="dark"
        icon="add"
        label="Add card"
        @click="addOpen = true"
      />
      <q-btn unelevated no-caps class="rb-btn" color="primary" label="Save" />
    </template>

    <div class="canvas">
      <div class="canvas__kpis">
        <div v-for="k in dashboardKpis" :key="k.label" class="kpi">
          <div class="kpi__head">
            <q-icon class="kpi__grip" name="drag_indicator" size="14px" />
            <span class="kpi__label">{{ k.label }}</span>
            <q-space />
            <q-icon class="kpi__more" name="more_horiz" size="14px" />
          </div>
          <span class="kpi__value">{{ k.value }}</span>
          <div class="kpi__foot">
            <AppBadge :tone="k.tone">{{ k.delta }}</AppBadge>
            <span class="kpi__vs">vs last month</span>
          </div>
        </div>
      </div>

      <draggable
        v-model="cards"
        item-key="id"
        handle=".card__grip"
        class="canvas__grid"
        ghost-class="card--ghost"
      >
        <template #item="{ element }">
          <section class="card" :class="`card--${element.span}`">
            <header class="card__head">
              <q-icon class="card__grip" name="drag_indicator" size="14px" />
              <span class="card__title">{{ element.title }}</span>
              <span v-if="element.subtitle" class="card__subtitle">{{ element.subtitle }}</span>
              <q-space />
              <q-btn flat dense round icon="more_horiz" size="xs" color="grey-7">
                <q-menu>
                  <q-list dense style="min-width: 140px">
                    <q-item v-close-popup clickable @click="removeCard(element.id)">
                      <q-item-section>Remove card</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </header>

            <div class="card__body">
              <BarChart v-if="element.viz === 'bar'" :data="barData" :highlight="0" />

              <LineChart
                v-else-if="element.viz === 'line'"
                :values="tripsOverTime"
                :labels="['Sep 1', 'Sep 5', 'Sep 9', 'Sep 13', 'Sep 17']"
              />

              <div v-else-if="element.viz === 'table'" class="mini-table">
                <div class="mini-table__row mini-table__row--head">
                  <span>Date</span>
                  <span class="mini-table__route">Route</span>
                  <span class="mini-table__status">Status</span>
                  <span class="mini-table__num">Students</span>
                </div>
                <div v-for="(row, i) in tripRows.slice(0, 6)" :key="i" class="mini-table__row">
                  <span>{{ row.tripDate.replace(', 2026', '') }}</span>
                  <span class="mini-table__route">{{ row.routeName }}</span>
                  <span class="mini-table__status">
                    <AppBadge :tone="statusTone[row.status]">{{ row.status }}</AppBadge>
                  </span>
                  <span class="mini-table__num">{{ row.studentCount }}</span>
                </div>
              </div>

              <div v-else class="card__center">
                <VizThumb
                  :type="element.viz"
                  :width="element.viz === 'pie' ? 160 : 420"
                  :height="180"
                />
              </div>
            </div>

            <q-icon class="card__resize" name="open_in_full" size="14px" />
          </section>
        </template>
      </draggable>
    </div>

    <AddCardDialog v-model="addOpen" :added-ids="addedIds" @add="addCards" />
  </BuilderLayout>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.composer {
  &__title {
    font-size: 15px;
    font-weight: 600;
    color: $text;
  }

  &__range {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 10px;
    border: 1px solid $border-strong;
    border-radius: $radius-md;
    background: $surface;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    color: $text;
    cursor: pointer;
  }
}

.canvas {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  padding: 24px;
  overflow-y: auto;

  @media (max-width: 1023px) {
    padding: 16px;
  }

  &__kpis {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 1023px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    align-items: start;

    @media (max-width: 1023px) {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}

.kpi {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: $surface;
  border: 1px solid $border;
  border-radius: $radius-lg;

  &:hover {
    border-color: $border-strong;

    .kpi__grip,
    .kpi__more {
      opacity: 1;
    }
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__grip,
  &__more {
    opacity: 0;
    color: $text-muted;
    transition: opacity 0.15s;
  }

  &__grip {
    cursor: grab;
  }

  &__label {
    font-size: 12px;
    color: $text-soft;
  }

  &__value {
    font-size: 28px;
    font-weight: 600;
    color: $text;
  }

  &__foot {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__vs {
    font-size: 12px;
    color: $text-muted;
  }
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 300px;
  background: $surface;
  border: 1px solid $border;
  border-radius: $radius-lg;

  &--wide {
    grid-column: span 2;

    @media (max-width: 1023px) {
      grid-column: span 1;
    }
  }

  &--ghost {
    background: rgba(238, 242, 255, 0.6);
    border: 1px dashed $brand;

    > * {
      visibility: hidden;
    }
  }

  &:hover {
    border-color: $border-strong;

    .card__grip,
    .card__resize {
      opacity: 1;
    }
  }

  &.sortable-chosen {
    border-color: $brand;
    box-shadow: $shadow-drag-lg;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    flex-shrink: 0;
    padding: 0 14px;
  }

  &__grip {
    opacity: 0;
    color: $text-muted;
    cursor: grab;
    transition: opacity 0.15s;
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: $text;
  }

  &__subtitle {
    font-size: 12px;
    color: $text-muted;
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 4px 14px 14px;
    overflow: hidden;
  }

  &__center {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  &__resize {
    position: absolute;
    right: 3px;
    bottom: 3px;
    opacity: 0;
    color: $text-muted;
    cursor: nwse-resize;
    transition: opacity 0.15s;
  }
}

.mini-table {
  display: flex;
  flex-direction: column;
  overflow: auto;

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 34px;
    flex-shrink: 0;
    padding: 0 4px;
    border-bottom: 1px solid $border;
    font-size: 12px;
    color: $text;

    > span:first-child {
      width: 80px;
      flex-shrink: 0;
      color: $text-soft;
    }

    &--head {
      position: sticky;
      top: 0;
      height: 30px;
      background: $surface-subtle;
      font-weight: 500;
      color: $text-soft;

      > span:first-child {
        color: $text-soft;
      }
    }
  }

  &__route {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__status {
    width: 96px;
    flex-shrink: 0;
  }

  &__num {
    width: 64px;
    flex-shrink: 0;
    text-align: right;
  }
}
</style>
