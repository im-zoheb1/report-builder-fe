<script lang="ts" setup>
withDefaults(defineProps<{ barHeight?: number; tinted?: boolean }>(), {
  barHeight: 52,
  tinted: false,
});
</script>

<template>
  <div class="builder" :class="{ 'builder--tinted': tinted }">
    <header class="builder__bar" :style="{ height: `${barHeight}px` }">
      <slot name="topbar" />
    </header>
    <div class="builder__body">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.builder {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $surface;

  &--tinted {
    background: $surface-subtle;
  }

  &__bar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    padding: 0 16px;
    background: $surface;
    border-bottom: 1px solid $border;
  }

  &__body {
    flex: 1;
    min-height: 0;
    display: flex;
  }
}
</style>
