<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    values: number[];
    labels?: string[];
    height?: number;
  }>(),
  { labels: () => [], height: 200 },
);

const W = 660;

const geometry = computed(() => {
  const h = props.height;
  const max = Math.max(...props.values, 1);
  const min = Math.min(...props.values, 0);
  const span = max - min || 1;
  const step = props.values.length > 1 ? W / (props.values.length - 1) : W;

  const points = props.values.map((v, i) => {
    const x = i * step;
    const y = h - 10 - ((v - min) / span) * (h - 24);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return {
    line: points.join(' '),
    area: `0,${h} ${points.join(' ')} ${W},${h}`,
  };
});
</script>

<template>
  <div class="line">
    <svg
      class="line__svg"
      :viewBox="`0 0 ${W} ${height}`"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <line
        v-for="g in 3"
        :key="g"
        x1="0"
        :y1="(height / 4) * g"
        :x2="W"
        :y2="(height / 4) * g"
        stroke="#f0f0f3"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
      <polygon :points="geometry.area" fill="rgba(79,70,229,0.08)" />
      <polyline
        :points="geometry.line"
        stroke="#4f46e5"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <div v-if="labels.length" class="line__axis">
      <span v-for="l in labels" :key="l">{{ l }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.line {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-height: 0;

  &__svg {
    flex: 1;
    width: 100%;
    min-height: 0;
  }

  &__axis {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: $text-muted;
  }
}
</style>
