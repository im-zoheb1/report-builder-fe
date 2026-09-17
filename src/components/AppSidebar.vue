<script lang="ts" setup>
import AppAvatar from '@/components/AppAvatar.vue';
import { collections, currentUser } from '@/data/mock';
</script>

<template>
  <nav class="sidebar">
    <div class="sidebar__brand">
      <span class="sidebar__mark">
        <q-icon name="bar_chart" size="14px" color="white" />
      </span>
      <span class="sidebar__brand-name">Waypoint Reports</span>
    </div>

    <router-link to="/reports" class="sidebar__nav" active-class="sidebar__nav--active">
      <q-icon name="description" size="16px" />
      Reports
    </router-link>
    <router-link to="/dashboards" class="sidebar__nav" active-class="sidebar__nav--active">
      <q-icon name="grid_view" size="16px" />
      Dashboards
    </router-link>

    <p class="sidebar__section">Collections</p>
    <div v-for="c in collections" :key="c.name" class="sidebar__collection">
      <q-icon name="storage" size="14px" />
      <span class="sidebar__collection-name">{{ c.name }}</span>
      <span class="sidebar__collection-count">{{ c.count }}</span>
    </div>

    <div class="sidebar__spacer" />

    <div class="sidebar__user">
      <AppAvatar :initials="currentUser.initials" />
      <span>{{ currentUser.name }}</span>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 100%;
  padding: 16px 12px;
  background: $surface-subtle;
  border-right: 1px solid $border;

  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 8px 16px;
  }

  &__mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: $radius-sm;
    background: $brand;
  }

  &__brand-name {
    font-size: 14px;
    font-weight: 600;
    color: $text;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 32px;
    padding: 0 10px;
    border-radius: $radius-md;
    font-size: 13px;
    color: $text-soft;
    text-decoration: none;

    &:hover {
      background: rgba(0, 0, 0, 0.03);
    }

    &--active {
      background: $surface-muted;
      color: $text;
      font-weight: 500;
    }
  }

  &__section {
    margin: 0;
    padding: 20px 10px 6px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: $text-muted;
  }

  &__collection {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 28px;
    padding: 0 10px;
    border-radius: $radius-sm;
    color: $text-soft;
    cursor: default;

    &:hover {
      background: rgba(0, 0, 0, 0.03);
    }
  }

  &__collection-name {
    flex: 1;
    font-size: 12px;
  }

  &__collection-count {
    font-size: 11px;
    color: $text-muted;
  }

  &__spacer {
    flex: 1;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border-top: 1px solid $border;
    font-size: 12px;
    font-weight: 500;
    color: $text;
  }
}
</style>
