import { createRouter, createWebHistory } from 'vue-router'

import Results from '../results/Results.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/results/:userId/:country/:year', component: Results },
  ],
})

export default router
