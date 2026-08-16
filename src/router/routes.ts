import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/reports',
  },
  {
    path: '/reports',
    component: (() => import('@/pages/ReportLibrary.vue')),
  },
];

export default routes;
