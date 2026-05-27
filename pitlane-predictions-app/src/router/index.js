import { createRouter, createWebHistory } from 'vue-router'

import Results from '../pages/Results.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      name: 'Results',
      path: '/results/:leagueId/:userId', 
      component: Results
    },
  ],
})

export default router