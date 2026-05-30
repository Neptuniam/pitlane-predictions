<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { drivers } from '@/data/drivers.js';
import { teams } from '@/data/teams.js';
import { calendar } from '@/data/calendar.js';

import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';

import { fetchPredictions } from '@/dummy_data/actions.js';

const props = defineProps({
    user: Object,
    league: Object
});

const router = useRouter();

const today = new Date();
const route = useRoute();
const countryId = ref(+route.query.countryId);
const year = ref(+route.query.year || today.getFullYear());
const errorMessage = ref();
const predictions = ref(null);

const futureEvents = computed(() => {
    if (year.value === undefined)
        return [];
    return Object.values(calendar[year.value]).filter(event => {
        if (!event.date)
            return false;
        const date = new Date(event.date);
        return date > today;
    });
});
const calendarEvent = computed(() => {
    if (countryId.value === undefined || year.value === undefined)
        return null;
    return calendar[year.value][countryId.value];
});
const isPastEvent = computed(() => {
    if (!calendarEvent?.value?.date)
        return false;
    const date = new Date(calendarEvent?.value?.date);
    return date < today;
});

if (countryId.value === undefined || year.value === undefined) {
    errorMessage.value = 'Missing track information.';
} else {
    _fetchPredictions();
}

function _fetchPredictions() {
    errorMessage.value = null;
    
    // Todo: This will allow all future events. Should be only next event?
    if (!isPastEvent.value)
        return fetchPredictions(props.user.id, props.league.id, calendarEvent?.value.country).then(_predictions => {
            predictions.value = {};

            _predictions.predictions.forEach(_prediction => {
                predictions.value[_prediction.category_id] = _prediction.prediction;
            });
        }).catch(_error => {
            errorMessage.value = _error;
        });
}
function changeTrack() {
    let str = `?countryId=${countryId.value}`;
    if (year.value != today.getFullYear())
        str += `&year=${year.value}`;
        
    window.history.replaceState(null, '', str);

    predictions.value = null;

    return _fetchPredictions();
}

function submitPredictions() {
    console.log(predictions.value);

    router.push({ path: `/league/${props.user.id}/${props.league.id}` });
}
</script>

<template>
<div id="Predict" class="page-container">
    <div class="page-title">
        {{ props.league?.name || 'the League' }} Predictions
    </div>
    <div class="select-center" style="margin: 0 auto 20px;">
        <Select 
            v-model="countryId"
            :options="futureEvents"
            optionLabel="country"
            optionValue="track_id"
            placeholder="Select a Track"
            @change="changeTrack"
            style="min-width: 150px"
        />
    </div>

    <div v-if="!!errorMessage" class="error-message">
        {{ errorMessage }}
    </div>
    <div v-else-if="isPastEvent" class="error-message">
        This event has already taken place. Please select a track that has not yet taken place to enter your predictions.
    </div>
    <div v-else-if="predictions === null" id="loading-message">
        Loading...
    </div>
    <div v-else style="max-width: 300px; margin: auto;">
        <div v-for="category in league.categories" :key="category.id">
            <label :for="`input-${category.id}`" class="font-bold block mb-2">
                {{ category.title.replace('<br>', ' ') }}
            </label>

            <Select v-if="category.type == 'driver' || category.type == 'team'"
                v-model="predictions[category.id]"
                :options="Object.values(category.type == 'driver' ? drivers : teams)"
                :optionLabel="category.type == 'driver' ? 'last_name' : 'name'"
                :optionValue="category.type == 'driver' ? 'number' : 'name'"
                placeholder="Select a Driver"
                :inputId="`input-${category.id}`"
                style="width: 100%; margin-bottom: 30px"
            />
            <InputNumber v-else
                v-model="predictions[category.id]"
                :inputId="`input-${category.id}`"
                style="width: 100%; margin-bottom: 30px"
            />
        </div>

        <div class="select-center" style="margin: 0 auto 20px;">
            <Button label="Submit Predictions" @click="submitPredictions" />
        </div>
    </div>
</div>
</template>

<style scoped>
</style>

