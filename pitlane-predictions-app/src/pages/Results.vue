<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import { drivers } from '@/data/drivers.js';
import { calendar } from '@/data/calendar.js';

import { fetchPredictions } from '@/dummy_data/actions.js';

import Select from 'primevue/select';

const props = defineProps({
    user: Object,
    league: Object
});

const today = new Date();
const route = useRoute();
const countryId = ref(+route.query.countryId);
const year = ref(+route.query.year || today.getFullYear());
const errorMessage = ref();
const predictions = ref(null);
const pointsEarned = ref(0);

const calendarEvent = computed(() => {
    if (countryId.value === undefined || year.value === undefined)
        return null;
    return calendar[year.value][countryId.value];
});
const isFutureEvent = computed(() => {
    if (!calendarEvent?.value?.date)
        return false;
    const date = new Date(calendarEvent?.value?.date);
    return date > today;
});

if (countryId.value === undefined || year.value === undefined) {
    errorMessage.value = 'Missing track information.';
} else {
    _fetchPredictions();
}

function _fetchPredictions() {
    errorMessage.value = null;
    
    if (!isFutureEvent.value)
        return fetchPredictions(props.user.value.id, calendarEvent?.value.country, year.value).then(_predictions => {
            predictions.value = _predictions;
            pointsEarned.value = _predictions.reduce((n, { correct, points }) => n + (correct ? points : 0), 0);
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
    pointsEarned.value = 0;

    return _fetchPredictions();
}
</script>

<template>
<div id="Results" class="page-container">
    <div class="page-title">
        {{ props.user?.first_name || 'Your' }}'s Prediction Results
    </div>
    <div class="select-center">
        <Select 
            v-model="countryId"
            :options="Object.values(calendar[year])"
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
    <div v-else-if="isFutureEvent" class="error-message">
        This event has not taken place yet, so prediction results cannot be calculated yet.
    </div>
    <div v-else-if="predictions === null" id="loading-message">
        Loading...
    </div>
    <template v-else-if="!!predictions && !!predictions.length">
        <div class="page-sub-title" style="margin: 20px auto 10px">
            Total Points Earned: {{ pointsEarned }}
        </div>

        <div id="predictions-container">
            <div v-for="prediction in predictions"
                class="prediction-container"
                :class="{
                    'correct': prediction.correct,
                    'in-correct': !prediction.correct,
                    'type-driver': prediction.type == 'driver',
                    'type-team': prediction.type == 'team'
                }"
            >
                <span class="prediction-category">
                    <span class="text-container" v-html="prediction.title"></span>
                </span>
                
                <span class="prediction-prediction text-container">
                    {{ drivers[prediction.prediction]?.last_name || prediction.prediction }}
                </span>

                <img v-if="!!prediction.profile" :src="prediction.profile" />

                <div v-if="prediction.points > 1" class="prediction-points" v-tooltip="'This category had a points multiplier!'">
                    x {{ prediction.points }}
                </div>
            </div>
        </div>
    </template>
</div>
</template>

<style scoped>
.error-message {
    font-size: 22px;
    color: red;

    text-align: center;

    margin-top: 40px
}
#loading-message {
    font-size: var(--text-body-size);
    text-align: center;
}
.error-message,
#loading-message,
#predictions-container {
    height: calc(100vh - 235px);
    overflow-y: auto;
    padding: 0px 10px
}
.prediction-container {
    position: relative;

    height: 75px;

    padding: 0px 0px;
    margin: 20px auto;

    background-color: var(--background-color-1);
    border: 1px solid grey;
    border-radius: 20px;

    line-height: 73px;

    overflow: hidden
}
.prediction-container.correct {
    border-color: var(--colour-success);
}
.prediction-container.in-correct {
    border-color: var(--colour-error);
}

.select-center {
    display: flex;
    justify-content: center;
    width: 100%;
    margin: 0 auto 20px;
}

.text-container {
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
    text-align: center;

    position: relative;
    top: -3px;
}
.prediction-category {
    display: inline-block;

    height: 100%;

    background-color: var(--background-color-2);
}
.prediction-category>.text-container {
    width: 100%;
}
.prediction-prediction {
    padding-left: 20px;
}
.prediction-container img {
    position: absolute;
    top: 0px;
    right: 0px;

    object-fit: contain;
}
.prediction-container.type-driver img {
    height: 100px;
}
.prediction-container.type-team img {
    height: 65px;
    padding-top: 10px;
    padding-right: 10px;
}
.prediction-result {
    position: absolute;
    top: 0px;
    right: 0px;

    height: 100%;
    width: 40px;

    text-align: center;
    font-size: 45px;
}
.prediction-points {
    position: absolute;
    top: 0px;
    right: 0px;

    background-color: var(--colour-gold);

    text-align: center;
    line-height: 15px;
    padding: 4px 8px 4px 10px;

    font-size: var( --text-sub-body-size);
    color: black;

    border-end-start-radius: 20px;
}

@media (max-width: 500px) {
    .prediction-container {
        font-size: 18px;
    }
    .prediction-category {
        width: 33%;
        min-width: 125px;
    }
}
@media (min-width: 500px) {
    .prediction-container {
        font-size: 28px;
    }
    .prediction-category {
        width: 210px;
    }
}
</style>
