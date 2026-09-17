<script lang="ts" setup>
import type { AvatarTone } from '@/data/mock';

withDefaults(
  defineProps<{
    initials: string;
    tone?: AvatarTone;
    size?: number;
  }>(),
  { tone: 'indigo', size: 20 },
);
</script>

<template>
  <span
    class="avatar"
    :class="`avatar--${tone}`"
    :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.45)}px` }"
  >
    {{ initials }}
  </span>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: $radius-pill;
  font-weight: 600;
  color: #fff;

  @each $name, $color in $avatar-colors {
    &--#{$name} {
      background: $color;
    }
  }
}
</style>
