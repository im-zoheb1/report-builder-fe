<script lang="ts" setup>
withDefaults(
  defineProps<{
    tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
  }>(),
  { tone: 'neutral' },
);
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">
    <slot />
  </span>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: $radius-xs;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;

  &--neutral {
    background: $surface-muted;
    color: $text-soft;
  }

  &--brand {
    background: $brand-soft;
    color: $brand;
  }

  &--success {
    background: $success-soft;
    color: $success;
  }

  &--warning {
    background: $warning-soft;
    color: $warning;
  }

  &--danger {
    background: $danger-soft;
    color: $danger;
  }
}
</style>
