<script lang="ts" setup>
defineProps<{
  label: string;
  icon?: string | undefined;
  selected?: boolean | undefined;
}>();
</script>

<template>
  <button type="button" class="chip" :class="{ 'chip--selected': selected }">
    <q-icon v-if="icon" :name="icon" size="13px" />
    {{ label }}
  </button>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid $border;
  border-radius: $radius-pill;
  background: $surface;
  font-family: inherit;
  font-size: 12px;
  color: $text-soft;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    border-color: $border-strong;
  }

  &--selected {
    background: $brand-soft;
    border-color: $brand-border;
    color: $brand;
    font-weight: 500;
  }
}
</style>
