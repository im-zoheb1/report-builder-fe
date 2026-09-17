<script lang="ts" setup>
import AppAvatar from '@/components/AppAvatar.vue';
import AppBadge from '@/components/AppBadge.vue';
import VizThumb from '@/components/VizThumb.vue';
import { vizIcons, vizLabels, type Report } from '@/data/mock';

defineProps<{ report: Report }>();
</script>

<template>
  <router-link :to="`/reports/${report.id}`" class="card">
    <div class="card__thumb">
      <VizThumb :type="report.viz" />
    </div>
    <div class="card__body">
      <div class="card__row">
        <span class="card__name">{{ report.name }}</span>
        <q-icon class="card__more" name="more_horiz" size="16px" />
      </div>
      <div class="card__row card__row--meta">
        <q-icon :name="vizIcons[report.viz]" size="14px" />
        <span class="card__type">{{ vizLabels[report.viz] }}</span>
        <span class="card__dot">·</span>
        <AppBadge>{{ report.collection }}</AppBadge>
      </div>
      <div class="card__row card__row--footer">
        <span class="card__updated">{{ report.updated }}</span>
        <q-space />
        <AppAvatar :initials="report.owner.initials" :tone="report.owner.tone" />
        <span class="card__owner">{{ report.owner.shortName }}</span>
      </div>
    </div>
  </router-link>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: $surface;
  border: 1px solid $border;
  border-radius: $radius-lg;
  text-decoration: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:hover {
    border-color: $border-strong;
    box-shadow: $shadow-card;

    .card__more {
      opacity: 1;
    }
  }

  &__thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    background: $surface-subtle;
    border-bottom: 1px solid $border;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;

    &--meta {
      gap: 6px;
      color: $text-soft;
    }

    &--footer {
      gap: 6px;
    }
  }

  &__name {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: $text;
  }

  &__more {
    opacity: 0;
    color: $text-muted;
    transition: opacity 0.15s;
  }

  &__type {
    font-size: 12px;
  }

  &__dot {
    font-size: 12px;
    color: $text-muted;
  }

  &__updated {
    font-size: 12px;
    color: $text-muted;
  }

  &__owner {
    font-size: 12px;
    color: $text-soft;
  }
}
</style>
