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
const leagueId = ref();
const routeName = ref();

const user = ref();
const leagues = ref();
const league = computed(() => !!leagueId.value && !!leagues.value?.length ? leagues.value.find(_league => _league.id == leagueId.value) : null);

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

// HACK: route.params isn't inited properly outside of router-view
setTimeout(() => {
    userId.value = +route.params.userId;
    leagueId.value = route.params.leagueId;
    routeName.value = route.name;

    fetchUserInfo(userId.value).then(res => {
        console.log(res);
        
        user.value = res.user;
        leagues.value = res.leagues;

        items.value[1].items = res.leagues.map(_league => ({
            id: _league.id,
            label: _league.name,
            to: `/league/${_league.id}/${userId.value}`
        }));
    })
}, 100)

function jumpToPage(item) {
    if (item.to) {
        router.push({ path: item.to })
        leagueId.value = item.id;
        routeName.value = item.name;
    }
}
</script>

<template>
    <main>
        <Menubar :model="items">
            <template #start>
                <Avatar image="/logo.jpg" shape="square" />
                
                <!-- <span style="position: absolute; left: 90px">
                    {{ league?.name || routeName }}
                </span> -->
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

        <RouterView v-if="!!user" :user="user" :league="league" />
    </main>
</template>

<style scoped>
.active-league {
    color: var(--p-primary-color);
}
</style>
