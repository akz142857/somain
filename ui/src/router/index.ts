import { createRouter, createWebHashHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'dashboard',
            component: Dashboard
        },
        {
            path: '/detail/:monitorId',
            name: 'detail',
            component: () => import('../views/FlowDetail.vue')
        }
    ]
});

export default router;
