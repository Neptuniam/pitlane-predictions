<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import { drivers } from '@/data/drivers.js';
import { calendar } from '@/data/calendar.js';
console.log(calendar);


import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import router from '@/router';

const props = defineProps({
    user: Object,
    league: Object
});

const latestEvent = computed(() => {
    const today = new Date();
    return Object.values(calendar[today.getFullYear()]).reverse().find(event => new Date(event.date) < today);
});
const nextEvent = computed(() => {
    const today = new Date();
    return Object.values(calendar[today.getFullYear()]).find(event => new Date(event.date) > today);
});
const nextEventDeadline = computed(() => {
    if (!nextEvent.value?.date)
        return null;

    const today = new Date();
    const target = new Date(nextEvent.value.date);
    const diff = target - today;

    if (diff <= 0)
        return 'Date has passed';

    const minutes = Math.floor(diff / 1000 / 60);
    const days = Math.floor(minutes / 60 / 24);
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;

    return `${days} days, ${hours} hours, ${mins} minutes`;
});

</script>

<template>
<div id="League" class="page-container">
    <div class="page-title">
        {{ props.league?.name || 'League' }}
    </div>
    <div class="page-sub-title">
        Total Participants: {{ props.league?.users.length || 0 }}
    </div>

    <div class="page-sub-title" style="margin: 20px auto 40px">
        Next prediction deadline in {{ nextEventDeadline }}
    </div>

    <div v-if="!!props.league?.name" class="card">
        <DataTable :value="props.league?.users">
            <Column header="Pos.">
                <template #body="slotProps">
                    {{ slotProps.data.position }}.
                </template>
            </Column>

            <Column header="Name">
                <template #body="slotProps">
                    {{ slotProps.data.first_name }} {{ slotProps.data.last_name }}
                </template>
            </Column>

            <Column header="PTS.">
                <template #body="slotProps">
                    {{ slotProps.data.points }}
                </template>
            </Column>
        </DataTable>
    </div>

    <div class="card">
        <router-link :to="`/results/${props.league.id}/${props.user.id}?countryId=${latestEvent.track_id}`">
            <div v-if="!!latestEvent" class="page-sub-title" style="margin-bottom: 50px">
                Results for {{ latestEvent?.track || latestEvent?.country }} are in!<br>Click here to see how you did.
            </div>
        </router-link>

        <div class="page-sub-title" style="margin-bottom: 0 !important">
            <router-link v-if="!!nextEvent" :to="`/predict/${props.league.id}/${props.user.id}?countryId=${nextEvent.track_id}`">
                 {{ nextEvent.track || nextEvent.country }} is next!<br>Click here to make your predictions.
            </router-link>
            <span v-else>
                No events left for this year.
            </span>
        </div>
    </div>
</div>
</template>

<style>
#League .card {
    border-radius: 12px;
    padding: 20px;
    margin-top: 50px;

    background-color: var(--background-color-1) !important;
}

a {
    color: inherit;
    text-decoration: none;
}
</style>


