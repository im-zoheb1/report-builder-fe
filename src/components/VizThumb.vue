<script lang="ts" setup>
import type { VizType } from '@/data/mock';

// The Figma thumbnails ship as exported SVGs, but this environment's network
// policy blocks figma.com, so they are redrawn here to the same geometry.
withDefaults(
  defineProps<{
    type: VizType;
    width?: number;
    height?: number;
  }>(),
  { width: 210, height: 88 },
);
</script>

<template>
  <div v-if="type === 'kpi'" class="viz-kpi">
    <span class="viz-kpi__value">1,248</span>
    <span class="viz-kpi__delta">+12% vs last month</span>
  </div>

  <svg
    v-else
    class="viz"
    :width="width"
    :height="height"
    :viewBox="type === 'pie' ? '0 0 88 88' : '0 0 210 88'"
    fill="none"
    aria-hidden="true"
  >
    <template v-if="type === 'table'">
      <rect
        v-for="c in 3"
        :key="`h${c}`"
        :x="(c - 1) * 72"
        y="0"
        width="58"
        height="9"
        rx="2"
        fill="#e2e2e8"
      />
      <template v-for="r in 5" :key="`r${r}`">
        <rect
          v-for="c in 3"
          :key="`r${r}c${c}`"
          :x="(c - 1) * 72"
          :y="20 + (r - 1) * 14"
          :width="c === 1 ? 64 : 52"
          height="7"
          rx="2"
          fill="#f0f0f3"
        />
      </template>
    </template>

    <template v-else-if="type === 'bar'">
      <rect
        v-for="(b, i) in [40, 56, 34, 72, 48, 30, 44]"
        :key="`b${i}`"
        :x="6 + i * 29"
        :y="88 - b"
        width="20"
        :height="b"
        rx="3"
        :fill="i === 3 ? '#4f46e5' : 'rgba(79,70,229,0.45)'"
      />
    </template>

    <template v-else-if="type === 'line'">
      <line x1="0" y1="70" x2="210" y2="70" stroke="#ededf1" stroke-width="1" />
      <line x1="0" y1="44" x2="210" y2="44" stroke="#ededf1" stroke-width="1" />
      <polyline
        points="4,66 34,58 64,62 94,44 124,40 154,26 184,20 206,12"
        stroke="#4f46e5"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>

    <template v-else-if="type === 'pie'">
      <circle cx="44" cy="44" r="40" fill="rgba(79,70,229,0.35)" />
      <path d="M44 44 L44 4 A40 40 0 1 1 10 63 Z" fill="#4f46e5" />
    </template>

    <template v-else-if="type === 'map'">
      <rect x="0" y="0" width="210" height="88" rx="4" fill="#f1f1f4" />
      <path d="M0 30 H210 M0 62 H210 M56 0 V88 M140 0 V88" stroke="#e5e5ea" stroke-width="3" />
      <rect x="146" y="36" width="46" height="34" rx="3" fill="#e8f0e8" />
      <polyline
        points="18,64 54,44 92,52 124,28 162,34"
        stroke="#4f46e5"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        v-for="(p, i) in [
          [18, 64],
          [54, 44],
          [92, 52],
          [124, 28],
          [162, 34],
        ]"
        :key="`p${i}`"
        :cx="p[0]"
        :cy="p[1]"
        r="3.5"
        fill="#ffffff"
        stroke="#4f46e5"
        stroke-width="2"
      />
    </template>
  </svg>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.viz {
  display: block;
}

.viz-kpi {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  &__value {
    font-size: 24px;
    font-weight: 600;
    color: $text;
  }

  &__delta {
    font-size: 11px;
    font-weight: 500;
    color: $success;
  }
}
</style>
