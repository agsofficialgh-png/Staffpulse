import { createRouter, createWebHistory } from 'vue-router'
import { activeRole, canAccessRoute, roleHome } from '../stores/session'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/AppLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/overview',
        },
        {
          path: 'overview',
          name: 'overview',
          component: () => import('../views/OverviewView.vue'),
        },
        {
          path: 'task-log',
          name: 'task-log',
          component: () => import('../views/TaskLogView.vue'),
        },
        {
          path: 'super-admin',
          name: 'super-admin',
          component: () => import('../views/SuperAdminView.vue'),
        },
        {
          path: 'worker-profile',
          name: 'worker-profile',
          component: () => import('../views/WorkerProfileView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/SettingsView.vue'),
        },
        {
          path: 'dashboards/it-support',
          name: 'dashboard-it-support',
          component: () => import('../views/RoleDashboardView.vue'),
          props: { dashboardId: 'it-support' },
        },
        {
          path: 'dashboards/finance',
          name: 'dashboard-finance',
          component: () => import('../views/RoleDashboardView.vue'),
          props: { dashboardId: 'finance' },
        },
        {
          path: 'dashboards/resource-mobilisation-marketing',
          name: 'dashboard-resource-mobilisation-marketing',
          component: () => import('../views/RoleDashboardView.vue'),
          props: { dashboardId: 'resource-mobilisation-marketing' },
        },
        {
          path: 'dashboards/media-communications',
          name: 'dashboard-media-communications',
          component: () => import('../views/RoleDashboardView.vue'),
          props: { dashboardId: 'media-communications' },
        },
        {
          path: 'hr',
          name: 'hr-dashboard',
          component: () => import('../views/HrDashboardView.vue'),
        },
        {
          path: 'hr/people',
          name: 'hr-people',
          component: () => import('../views/HrRecordsView.vue'),
          props: { module: 'people' },
        },
        {
          path: 'hr/hr-records',
          name: 'hr-records',
          component: () => import('../views/HrRecordsView.vue'),
          props: { module: 'hr-records' },
        },
        {
          path: 'hr/administration',
          name: 'hr-administration',
          component: () => import('../views/HrRecordsView.vue'),
          props: { module: 'administration' },
        },
        {
          path: 'hr/activities',
          name: 'hr-activities',
          component: () => import('../views/HrRecordsView.vue'),
          props: { module: 'activities' },
        },
        {
          path: 'hr/issues',
          name: 'hr-issues',
          component: () => import('../views/HrRecordsView.vue'),
          props: { module: 'issues' },
        },
        {
          path: 'hr/training',
          name: 'hr-training',
          component: () => import('../views/HrRecordsView.vue'),
          props: { module: 'training' },
        },
        {
          path: 'hr/documents',
          name: 'hr-documents',
          component: () => import('../views/HrRecordsView.vue'),
          props: { module: 'documents' },
        },
        {
          path: 'hr/management-actions',
          name: 'hr-management-actions',
          component: () => import('../views/HrRecordsView.vue'),
          props: { module: 'management-actions' },
        },
        {
          path: 'hr/kpis',
          name: 'hr-kpis',
          component: () => import('../views/HrRecordsView.vue'),
          props: { module: 'kpis' },
        },
        {
          path: 'hr/deadlines',
          name: 'hr-deadlines',
          component: () => import('../views/HrRecordsView.vue'),
          props: { module: 'deadlines' },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/overview',
    },
  ],
})

router.beforeEach((to) => {
  if (to.name === 'login') return true

  const role = activeRole.value
  if (!role) return { name: 'login' }
  if (to.name && canAccessRoute(role, String(to.name))) return true

  return roleHome(role)
})

export default router
