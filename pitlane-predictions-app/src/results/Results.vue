<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { drivers } from '@/data/drivers.js';

import { fetchUserInfo, fetchPredictions } from '@/dummy_data/actions.js';

const route = useRoute();
const { userId, country, year } = route.params;

const user = ref();
const league = ref();
const errorMessage = ref();
const predictions = ref();
const pointsEarned = ref();

fetchUserInfo(userId).then(res => {
    user.value = res.user;
    league.value = res.league;
})

fetchPredictions(userId, country, year).then(_predictions => {
    console.log('_predictions', _predictions);
    
    predictions.value = _predictions;
    pointsEarned.value = _predictions.reduce((n, { correct, points }) => n + (correct ? points : 0), 0);
}).catch(_error => {
    errorMessage.value = _error;
});
</script>

<template>
    <h1>
        {{ user?.first_name || 'Your' }} Prediction Results
    </h1>
    <h3>
        {{ country }}, {{ year }}
    </h3>
  
    <div v-if="!!errorMessage" class="error-message">
        {{ errorMessage }}
    </div>
    <div v-else-if="!!predictions && !!predictions.length" style="margin: 60px auto; padding: 0px 30px">
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
        </div>

        <h2 style="margin-top: 60px">
            Total Points Earned: {{ pointsEarned }}
        </h2>
    </div>
</template>

<style scoped>
h1, h2, h3 {
    text-align: center;
}
.error-message {
    font-size: 22px;
    color: red;

    text-align: center;

    margin-top: 40px
}
.prediction-container {
    position: relative;

    height: 75px;
    max-width: 650px;

    padding: 0px 0px;
    margin: 20px auto;

    border: 1px solid grey;
    border-radius: 20px;

    font-size: 28px;

    line-height: 73px;

    overflow: hidden
}
.prediction-container.correct {
    border-color: green;
}
.prediction-container.in-correct {
    border-color: red;
}

.text-container {
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
    text-align: center;
}
.prediction-category {
    display: inline-block;

    height: 100%;
    width: 33%;
    min-width: 100px;

    background-color: #1e1f28;
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
    height: 60px;
    padding-top: 7.5px;
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
</style>
