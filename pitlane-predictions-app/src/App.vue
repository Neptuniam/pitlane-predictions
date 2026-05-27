<script setup>
import Menubar from 'primevue/menubar';
import Badge from 'primevue/badge';
import Avatar from 'primevue/avatar';

import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { fetchUserInfo } from '@/dummy_data/actions.js';

const user = ref();
const leagues = ref();

const items = ref([
    {
        label: 'Dashboard',
        icon: 'pi pi-home',
        to: '/'
    },
    {
        label: 'Leagues',
        icon: 'pi pi-flag',
        items: []
    },
    {
        separator: true
    },
    {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
            console.log('logout')
        }
    }
]);
const userId = ref();
const leagueId = ref();
const routeName = ref();
const route = useRoute();
const router = useRouter();

// HACK: route.params isn't inited properly outside of router-view
setTimeout(() => {
    userId.value = +route.params.userId;
    leagueId.value = route.params.leagueId;
    routeName.value = route.name;

    fetchUserInfo(userId.value).then(res => {
        user.value = res.user;
        leagues.value = res.leagues;

        items.value[1].items = res.leagues.map(_league => ({
            id: _league.id,
            label: _league.name,
            to: `/leagues/${_league.id}/${userId.value}`
        }));
    })
}, 100)

function jumpToPage(item) {
    if (item.to)
        router.push({ path: item.to })
}
</script>

<template>
    <main>
        <Menubar :model="items">
            <template #start>
                <Avatar image="/logo.jpg" shape="square" />
                
                <span style="position: absolute; left: 90px">
                    {{ routeName }}
                </span>
            </template>
            <template #item="{ item, props, hasSubmenu, root }">
                <div v-ripple class="flex items-center" :class="{ 'active-league': leagueId && item.id == leagueId }" @click="jumpToPage(item)" v-bind="props.action">
                    <span>{{ item.label }}</span>
                    <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
                    <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">
                        {{ item.shortcut }}
                    </span>
                    <i v-if="hasSubmenu" :class="['pi pi-angle-down ml-auto', { 'pi-angle-down': root, 'pi-angle-right': !root }]"></i>
                </div>
            </template>
            <template #end>
                <div class="flex items-center gap-2">
                    <Avatar image="/drivers/bottas.png" shape="circle" />
                </div>
            </template>
        </Menubar>

        <RouterView :user="user" />
    </main>
</template>

<style>
.p-menubar,
.p-menubar-root-list {
    background-color: var(--background-color-1) !important;
}
.p-menubar-submenu {
    background-color: var(--background-color-2) !important;
}
.p-menubar-item:hover,
.p-menubar-item-content:hover {
    background-color: var(--background-color-3) !important;
}

.active-league {
    color: var(--p-primary-color);
}
</style>
