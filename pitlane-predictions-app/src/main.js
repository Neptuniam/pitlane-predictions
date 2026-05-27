import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
// import Lara from '@primeuix/themes/lara';
// import Material from '@primeuix/themes/material';
// import Nora from '@primeuix/themes/nora';

import App from './App.vue'
import router from './router'

import '@/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.mount('#app')
