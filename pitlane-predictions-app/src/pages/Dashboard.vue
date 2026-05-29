<script setup>
import { nextEvent, nextEventDeadline } from '@/data/calendar.js';

import Card from 'primevue/card';
import Badge from 'primevue/badge';

const props = defineProps({
    user: Object,
    leagues: Array
});

function getPos(league) {
    return league.users.findIndex(user => user.id == props.user.id) + 1;
}
</script>

<template>
<div id="Dashboard" class="page-container">
    <div class="page-title">
        Welcome back {{ props.user?.first_name }}!
    </div>

    <div class="page-sub-title" style="margin: 20px auto 40px">
        {{ nextEvent?.track || nextEvent?.country }} prediction deadline is in<br>{{ nextEventDeadline() }}
    </div>

    <div v-if="!leagues?.length">
        <p>You are not a member of any leagues.</p>
    </div>
    <div v-else>
        <router-link v-for="league in leagues" :key="league.id" :to="`/league/${props.user.id}/${league.id}`">
            <Card style="margin-bottom: 20px">
                <template #title>
                    <b>
                        {{ league.name }}
                    </b>
                </template>
                <template #content>
                    <div>
                        {{ league.id == '23de2-32wds-dsd23' ? 'PRIVATE' : 'PUBLIC' }} | Total Participants: {{ league.users.length }} 
                    </div>

                    <Badge style="margin-top: 15px" :severity="getPos(league) == 1 ? 'gold' : 'info'">
                        P{{ getPos(league) }}
                    </Badge>
                    
                    <div class="m-0" style="color: var(--colour-warning); margin-top: 30px">
                        Enter your predictions.
                    </div>
                </template>
            </Card>
        </router-link>
    </div>
</div>
</template>

<style scoped>
</style>
