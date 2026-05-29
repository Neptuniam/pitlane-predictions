<script setup>
import { latestEvent, nextEvent, nextEventDeadline } from '@/data/calendar.js';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';

const props = defineProps({
    user: Object,
    league: Object
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
        {{ nextEvent?.track || nextEvent?.country }} prediction deadline is in<br>{{ nextEventDeadline() }}
    </div>

    <Card v-if="!!props.league?.name">
        <template #content>
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
        </template>
    </Card>

    <router-link v-if="!!latestEvent" :to="`/results/${props.user.id}/${props.league.id}?countryId=${latestEvent.track_id}`">
        <Card v-if="!!props.league?.id">
            <template #content>
                <div class="page-sub-title" style="margin-bottom: 0 !important">
                    Results for {{ latestEvent?.track || latestEvent?.country }} are in!<br>Click here to see how you did.
                </div>
            </template>
        </Card>
    </router-link>

    <router-link v-if="!!nextEvent" :to="`/predict/${props.user.id}/${props.league.id}?countryId=${nextEvent.track_id}`">
        <Card>
            <template #content>
                <div class="page-sub-title" style="margin-bottom: 0 !important">
                    {{ nextEvent.track || nextEvent.country }} is next!<br>Click here to make your predictions.
                </div>
            </template>
        </Card>
    </router-link>
    <Card v-else>
        <template #content>
            <span class="page-sub-title" style="margin-bottom: 0 !important">
                No events left for this year.
            </span>
        </template> 
    </Card>
</div>
</template>

<style>
#League .p-card {
    margin-top: 40px;
}

a {
    color: inherit;
    text-decoration: none;
}
</style>


