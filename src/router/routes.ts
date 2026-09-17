import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/reports',
  },
  {
    path: '/reports',
    component: () => import('@/pages/ReportLibrary.vue'),
  },
  {
    path: '/reports/:id',
    component: () => import('@/pages/ReportBuilder.vue'),
  },
  {
    path: '/dashboards',
    component: () => import('@/pages/DashboardsList.vue'),
  },
  {
    path: '/dashboards/:id',
    component: () => import('@/pages/DashboardComposer.vue'),
  },
];

export default routes;
