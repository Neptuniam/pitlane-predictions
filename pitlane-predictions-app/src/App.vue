<script setup>
import Menubar from 'primevue/menubar';
import Badge from 'primevue/badge';
import Avatar from 'primevue/avatar';

import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { fetchUserInfo } from '@/dummy_data/actions.js';

const route = useRoute();
const router = useRouter();

const userId = ref();
const leagueId = computed(() => route.params.leagueId ? route.params.leagueId : null);

const user = ref();
const leagues = ref();
const league = computed(() => {
    if (!leagueId.value || !leagues.value?.length)
        return null;
    return leagues.value.find(_league => _league.id === leagueId.value) || null;
});

const items = ref([
    {
        label: 'Dashboard',
        icon: 'pi pi-home',
        path: ''
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

// HACK: route.params isn't inited properly outside of router-view
setTimeout(() => {
    userId.value = +route.params.userId;
    leagueId.value = route.params.leagueId;

    fetchUserInfo(userId.value).then(res => {
        console.log(res);
        
        user.value = res.user;
        leagues.value = res.leagues;

        items.value[0].path = `/dashboard/${userId.value}`;
        items.value[1].items = res.leagues.map(_league => ({
            id: _league.id,
            label: _league.name,
            path: `/league/${userId.value}/${_league.id}`
        }));
    })
}, 100);

function jumpToPage(item) {
    if (item.path) 
        router.push({ path: item.path });
}
</script>

<template>
    <main>
        <Menubar :model="items">
            <template #start>
                <Avatar image="/logo.jpg" shape="square" />
            </template>
            <template #item="{ item, props, hasSubmenu, root }">
                <div class="flex items-center" :class="{ 'active-league': leagueId && item.id == leagueId }" @click="jumpToPage(item)" v-bind="props.action">
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

        <RouterView v-if="!!user && !!league" :user="user" :league="league" />
        <RouterView v-else-if="!!user && leagues !== null" :user="user" :leagues="leagues" />
    </main>
</template>

<style scoped>
.p-menubar {
    position: sticky;
    top: 4px;
    z-index: 100;
}

.active-league {
    color: var(--p-primary-color);
}
</style>
