import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/reports',
  },
  {
    path: '/reports',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [{ path: '', name: 'reports-list', component: () => import('@/pages/ReportsListPage.vue') }],
  },
  {
    path: '/reports/new',
    component: () => import('@/layouts/BuilderLayout.vue'),
    children: [{ path: '', name: 'report-new', component: () => import('@/pages/ReportBuilderPage.vue') }],
  },
  {
    path: '/reports/:id/edit',
    component: () => import('@/layouts/BuilderLayout.vue'),
    children: [
      { path: '', name: 'report-edit', component: () => import('@/pages/ReportBuilderPage.vue'), props: true },
    ],
  },
  {
    path: '/reports/:id',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'report-view', component: () => import('@/pages/ReportViewerPage.vue'), props: true },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
