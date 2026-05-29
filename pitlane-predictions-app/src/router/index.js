import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '../pages/Dashboard.vue';
import League from '../pages/League.vue';
import Results from '../pages/Results.vue';
import Predict from '../pages/Predict.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      name: 'Dashboard',
      path: '/dashboard/:userId', 
      component: Dashboard
    },
    { 
      name: 'League',
      path: '/league/:userId/:leagueId', 
      component: League
    },
    { 
      name: 'Results',
      path: '/results/:userId/:leagueId', 
      component: Results
    },
    { 
      name: 'Predict',
      path: '/predict/:userId/:leagueId', 
      component: Predict
    }
  ],
})

export default router