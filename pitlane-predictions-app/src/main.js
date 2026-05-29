import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';
import Tooltip from 'primevue/tooltip';
import Aura from '@primeuix/themes/aura';
// import Lara from '@primeuix/themes/lara';
// import Material from '@primeuix/themes/material';
// import Nora from '@primeuix/themes/nora';

import App from './App.vue'
import router from './router'

import '@/main.css'

const app = createApp(App)


/* Works because highlight tokens are defined under colorScheme */
const MyPreset = definePreset(Aura, {
    semantic: {
        colorScheme: {
            light: {
            },
            dark: {
                surface: {
                    0: '#ffffff',
                    50: '{slate.50}',
                    100: '{slate.100}',
                    200: '{slate.200}',
                    300: '{slate.300}',
                    400: '{slate.400}',
                    500: '{slate.500}',
                    600: '{slate.600}',
                    700: 'var(--background-color-2)', // border
                    800: 'var(--background-color-2)',
                    900: 'var(--background-color-1)',
                    950: 'var(--background-color-1)'
                }
            }
        }
    }
});



app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: MyPreset
    }
});
app.directive('tooltip', Tooltip);

app.mount('#app')
