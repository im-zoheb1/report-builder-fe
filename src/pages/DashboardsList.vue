<script lang="ts" setup>
import { computed, ref } from 'vue';

import AppAvatar from '@/components/AppAvatar.vue';
import DashboardThumb from '@/components/DashboardThumb.vue';
import LibraryLayout from '@/layouts/LibraryLayout.vue';
import { dashboards } from '@/data/mock';

const search = ref('');

const visible = computed(() =>
  dashboards.filter((d) => d.name.toLowerCase().includes(search.value.trim().toLowerCase())),
);
</script>

<template>
  <LibraryLayout>
    <q-page class="dashboards">
      <header class="dashboards__header">
        <div>
          <h1 class="rb-title">Dashboards</h1>
          <p class="rb-subtitle">
            {{ dashboards.length }} dashboards · built from your saved reports
          </p>
        </div>
        <q-space />

        <q-input
          v-model="search"
          dense
          outlined
          class="rb-input dashboards__search"
          placeholder="Search dashboards…"
        >
          <template #prepend>
            <q-icon name="search" size="14px" />
          </template>
        </q-input>

        <q-btn
          unelevated
          class="rb-btn"
          color="primary"
          icon="add"
          label="New Dashboard"
          to="/dashboards/new"
        />
      </header>

      <div class="dashboards__grid">
        <router-link v-for="d in visible" :key="d.id" :to="`/dashboards/${d.id}`" class="dash-card">
          <div class="dash-card__thumb">
            <DashboardThumb />
          </div>
          <div class="dash-card__body">
            <div class="dash-card__row">
              <span class="dash-card__name">{{ d.name }}</span>
              <q-icon class="dash-card__more" name="more_horiz" size="16px" />
            </div>
            <div class="dash-card__row dash-card__row--meta">
              <q-icon name="grid_view" size="13px" />
              <span>{{ d.cards }} cards</span>
              <span class="dash-card__dot">·</span>
              <span class="dash-card__viewed">{{ d.viewed }}</span>
              <q-space />
              <AppAvatar :initials="d.owner.initials" :tone="d.owner.tone" />
            </div>
          </div>
        </router-link>

        <router-link to="/dashboards/new" class="dash-new">
          <span class="dash-new__mark">
            <q-icon name="add" size="16px" />
          </span>
          <span class="dash-new__title">New dashboard</span>
          <span class="dash-new__hint">Combine saved reports on a grid</span>
        </router-link>
      </div>
    </q-page>
  </LibraryLayout>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.dashboards {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px 40px;

  @media (max-width: 1023px) {
    padding: 20px 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;

    h1,
    p {
      margin: 0;
    }

    p {
      margin-top: 4px;
    }
  }

  &__search {
    width: 260px;

    @media (max-width: 1023px) {
      order: 10;
      width: 100%;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 1100px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 700px) {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}

.dash-card {
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

    .dash-card__more {
      opacity: 1;
    }
  }

  &__thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 172px;
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
    gap: 6px;

    &--meta {
      font-size: 12px;
      color: $text-soft;
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

  &__dot,
  &__viewed {
    color: $text-muted;
  }
}

.dash-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 240px;
  border: 1px dashed $border-strong;
  border-radius: $radius-lg;
  text-decoration: none;

  &:hover {
    border-color: $brand;
    background: rgba(79, 70, 229, 0.02);
  }

  &__mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: $radius-pill;
    background: $surface-muted;
    color: $text-soft;
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: $text-soft;
  }

  &__hint {
    font-size: 12px;
    color: $text-muted;
  }
}
</style>
