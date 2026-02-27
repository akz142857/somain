import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/ecommerce'
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('../views/Settings.vue')
        },
        {
            path: '/:projectCode',
            name: 'dashboard',
            component: Dashboard
        },
        {
            path: '/:projectCode/alerts',
            name: 'alerts',
            component: () => import('../views/AlertManagement.vue')
        },
        {
            path: '/:projectCode/detail/:monitorId',
            name: 'detail',
            component: () => import('../views/FlowDetail.vue')
        }
    ]
});

export default router;
