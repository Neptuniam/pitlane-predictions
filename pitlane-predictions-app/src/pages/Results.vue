<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import { drivers } from '@/data/drivers.js';
import { calendar } from '@/data/calendar.js';

import { fetchPredictions } from '@/dummy_data/actions.js';

const props = defineProps({
    user: Object
});

const route = useRoute();
const userId = ref(+route.params.userId);
const countryId = ref(+route.query.countryId);
const year = ref(+route.query.year || 2026);
const errorMessage = ref();
const predictions = ref(null);
const pointsEarned = ref(0);
const page = ref();
const pageCount = ref();
const today = new Date();

const calendarEvent = computed(() => {
    if (countryId.value === undefined || year.value === undefined)
        return null;
    return calendar[year.value][countryId.value];
})
const isFutureEvent = computed(() => {
    if (!calendarEvent?.value?.date)
        return false;
    const date = new Date(calendarEvent?.value?.date);
    return date > today;
})

if (userId.value === undefined || countryId.value === undefined || year.value === undefined) {
    errorMessage.value = 'Missing user or country query parameters';
} else {
    page.value = countryId.value+1;
    pageCount.value = Object.keys(calendar[year.value]).length;

    _fetchPredictions();
}

function _fetchPredictions() {
    if (!isFutureEvent.value)
        return fetchPredictions(userId.value, calendarEvent?.value.country, year.value).then(_predictions => {
            errorMessage.value = null;
            predictions.value = _predictions;
            pointsEarned.value = _predictions.reduce((n, { correct, points }) => n + (correct ? points : 0), 0);
        }).catch(_error => {
            errorMessage.value = _error;
        });
}
function changePage() {
    let str = `?userId=${userId.value}&countryId=${page.value-1}`;
    if (year.value != '2026')
        str += `&year=${year.value}`;

    window.history.replaceState(null, '', str);
    
    countryId.value = page.value-1;

    predictions.value = null;
    pointsEarned.value = 0;

    return _fetchPredictions();
}
</script>

<template>
<div id="Results">
    <h1 class="page-title">
        {{ props.user?.first_name || 'Your' }}'s Prediction Results
    </h1>
    <h3 class="page-sub-title">
        {{ calendarEvent.track || calendarEvent.country }}, {{ year }}
    </h3>

    <h3 class="page-sub-title" style="margin: 20px auto 40px">
        Total Points Earned: {{ pointsEarned }}
    </h3>

    <div v-if="!!errorMessage" class="error-message">
        {{ errorMessage }}
    </div>
    <div v-else-if="isFutureEvent" class="error-message">
        This event has not taken place yet, so prediction results cannot be calculated yet.
    </div>
    <div v-else-if="predictions === null" id="loading-message">
        Loading...
    </div>
    <div v-else-if="!!predictions && !!predictions.length" id="predictions-container">
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

            <!-- <UTooltip v-if="prediction.points > 1" text="This category had a points multiplier!"> -->
                <div v-if="prediction.points > 1" class="prediction-points">
                    x {{ prediction.points }}
                </div>
            <!-- </UTooltip> -->
        </div>
    </div>

    <!-- <div style="padding: 15px 45px 5px; margin: auto;">
        <UPagination v-if="pageCount !== null"
            v-model:page="page"
            :ui="{ wrapper: 'justify-center'}"
            :items-per-page="3"
            :sibling-count="1"
            :total="pageCount*3"
            size="xl"
            @update:page="changePage"
        >
            <template #item="{ page, item }">
                <UButton :color="item.value == page ? 'primary' : 'neutral'" variant="outline" size="xl" style="min-width: 100px; text-align: center;">
                    {{ calendar[year][item.value-1]?.track || calendar[year][item.value-1]?.country || item.value }}
                </UButton>
            </template>
        </UPagination>
    </div> -->
</div>
</template>

<style scoped>
#Results {
    position: relative;

    padding: 30px 30px 0px 30px;
    width: 100%;

    max-width: 640px;
    margin: auto;
}
h1, h2, h3 {
    text-align: center;
}
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
    /* margin: 60px auto; */

    height: calc(100vh - 290px);
    overflow-y: auto;
    padding: 0px 20px
}
.prediction-container {
    position: relative;

    height: 75px;

    padding: 0px 0px;
    margin: 20px auto;

    border: 1px solid grey;
    border-radius: 20px;

    font-size: 28px;

    line-height: 73px;

    overflow: hidden
}
.prediction-container.correct {
    border-color: var(--colour-success);
}
.prediction-container.in-correct {
    border-color: var(--colour-error);
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
    width: 210px;

    background-color: var(--background-color-1);
}
.prediction-category>.text-container {
    width: 100%;
}
.prediction-prediction {
    padding: 0px 20px;
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

    /* height: 30px;
    width: 60px; */

    /* background-color: oklch(27.9% .041 260.031); */
    background-color: #EFBF04;

    text-align: center;
    line-height: 15px;
    padding: 4px 8px 4px 10px;

    font-size: var( --text-sub-body-size);
    /* color: #EFBF04; */
    color: black;

    border-end-start-radius: 20px;
}
</style>
