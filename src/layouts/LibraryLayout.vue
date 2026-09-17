<script lang="ts" setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';

import AppSidebar from '@/components/AppSidebar.vue';

const $q = useQuasar();
const drawerOpen = ref(false);
</script>

<template>
  <q-layout view="lHh LpR lFf">
    <q-header v-if="!$q.screen.gt.sm" class="mobile-bar">
      <div class="mobile-bar__inner">
        <span class="mobile-bar__mark">
          <q-icon name="bar_chart" size="14px" color="white" />
        </span>
        <span class="mobile-bar__title">Waypoint Reports</span>
        <q-space />
        <q-btn flat dense round icon="menu" color="dark" @click="drawerOpen = !drawerOpen" />
      </div>
    </q-header>

    <q-drawer
      v-model="drawerOpen"
      :show-if-above="$q.screen.gt.sm"
      :width="232"
      :breakpoint="1023"
      bordered
      class="drawer"
    >
      <AppSidebar />
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>

    <q-footer v-if="!$q.screen.gt.sm" class="mobile-tabs">
      <router-link to="/reports" class="mobile-tabs__tab" active-class="mobile-tabs__tab--active">
        <q-icon name="description" size="20px" />
        Reports
      </router-link>
      <router-link
        to="/dashboards"
        class="mobile-tabs__tab"
        active-class="mobile-tabs__tab--active"
      >
        <q-icon name="grid_view" size="20px" />
        Dashboards
      </router-link>
    </q-footer>
  </q-layout>
</template>

<style lang="scss" scoped>
@use '../css/tokens' as *;

.drawer :deep(.q-drawer) {
  background: $surface-subtle;
}

.mobile-bar {
  background: $surface;
  border-bottom: 1px solid $border;
  color: $text;

  &__inner {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 52px;
    padding: 0 16px;
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

  &__title {
    font-size: 14px;
    font-weight: 600;
  }
}

.mobile-tabs {
  display: flex;
  background: $surface;
  border-top: 1px solid $border;

  &__tab {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 0;
    font-size: 11px;
    color: $text-muted;
    text-decoration: none;

    &--active {
      color: $brand;
    }
  }
}
</style>
