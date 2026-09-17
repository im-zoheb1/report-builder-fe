<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    data: { label: string; value: number }[];
    highlight?: number;
    compact?: boolean;
  }>(),
  { highlight: -1, compact: false },
);

const max = computed(() => Math.max(...props.data.map((d) => d.value), 1));

function heightFor(value: number) {
  return `${Math.max((value / max.value) * 100, 2)}%`;
}
</script>

<template>
  <div class="bars" :class="{ 'bars--compact': compact }">
    <div class="bars__plot">
      <div v-for="(d, i) in data" :key="d.label" class="bars__col">
        <span class="bars__value">{{ d.value.toLocaleString() }}</span>
        <span
          class="bars__bar"
          :class="{ 'bars__bar--on': i === highlight }"
          :style="{ height: heightFor(d.value) }"
        />
      </div>
    </div>
    <div class="bars__axis">
      <span v-for="d in data" :key="d.label">{{ d.label }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-height: 0;

  &__plot {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    flex: 1;
    min-height: 0;
    border-bottom: 1px solid $border;
  }

  &__col {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    height: 100%;
    min-width: 0;
  }

  &__value {
    font-size: 11px;
    color: $text-soft;
  }

  &__bar {
    width: 100%;
    border-radius: 4px 4px 0 0;
    background: $brand-muted;

    &--on {
      background: $brand;
    }
  }

  &__axis {
    display: flex;
    gap: 10px;

    span {
      flex: 1;
      min-width: 0;
      font-size: 11px;
      color: $text-muted;
      text-align: center;
    }
  }

  &--compact .bars__value {
    display: none;
  }
}
</style>
