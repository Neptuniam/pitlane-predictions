<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { drivers } from '@/data/drivers.js';

const route = useRoute()

const { userId, country, year } = route.params;
const predictions = [
    {
        category: 'pole',
        prediction: 63,
        correct: null
    }, {
        category: 'p1',
        prediction: 63,
        correct: null
    }, {
        category: 'p2',
        prediction: 12,
        correct: null
    }, {
        category: 'p3',
        prediction: 16,
        correct: null
    }, {
        category: 'dnf_count',
        prediction: 4,
        correct: null
    }
];
const parsedResults = ref();
const errorMessage = ref();

axios.get(`https://api.openf1.org/v1/sessions?country_name=${country}&year=${year}`).then(sessions => {
    const qualifyingSession = sessions?.data.find(_s => _s.session_name == 'Qualifying');
    const gpSession = sessions?.data.find(_s => _s.session_name == 'Race');
    
    if (!!qualifyingSession && !!gpSession) {
        Promise.all([
            axios.get(`https://api.openf1.org/v1/starting_grid?session_key=${qualifyingSession.session_key}&position%3C=4`),
            axios.get(`https://api.openf1.org/v1/session_result?session_key=${gpSession.session_key}`)
        ]).then(res => {
            const startingGrid = res[0];
            const raceResult = res[1];
            
            parsedResults.value = {
                pole: startingGrid?.data[0]?.driver_number,
                p1: raceResult?.data[0]?.driver_number,
                p2: raceResult?.data[1]?.driver_number,
                p3: raceResult?.data[2]?.driver_number,
                dnf_count: raceResult?.data?.filter(_driver => _driver.dnf).length,
                dns_count: raceResult?.data?.filter(_driver => _driver.dns).length,
                dsq_count: raceResult?.data?.filter(_driver => _driver.dsq).length
            }

            predictions.forEach(_prediction => {
                _prediction.correct = parsedResults.value[_prediction.category] == _prediction.prediction;
            })
        }).catch(() => {
            errorMessage.value = 'Failed to find race results';
        });
    } else {
        errorMessage.value = 'Missing required sessions';
    }
}).catch(() => {
    errorMessage.value = 'Invalid Session';
});

function readableCat(cat) {
    return cat.replace('_', ' ').toUpperCase();
}
</script>

<template>
    <h1>
        Your Prediction Results
    </h1>
    <h3>
        {{ country }}, {{ year }}
    </h3>
  
    <div v-if="!!errorMessage" class="error-message">
        {{ errorMessage }}
    </div>
    <div v-else-if="!!parsedResults" style="margin: 60px auto; padding: 0px 10px">
        <div v-for="prediction in predictions"
            class="prediction-container"
            :class="{
                'correct': prediction.correct,
                'in-correct': !prediction.correct
            }"
        >
            <span class="prediction-category">
                {{ readableCat(prediction.category) }}
            </span>
            
            <span class="prediction-prediction">
                {{ drivers[prediction.prediction]?.last_name || prediction.prediction }}
            </span>

            <img v-if="!prediction.category.includes('count')" :src="`/drivers/${drivers[prediction.prediction]?.profile}`" />
            <span class="prediction-result">
                {{ prediction.correct ? '&#10003;' : '&#120;' }}
            </span>
        </div>

        <h2 style="margin-top: 60px">
            Total Points Earned: {{ predictions.filter(_p => _p.correct)?.length }}
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

    padding: 0px 0px;
    margin: 20px auto;

    border: 1px solid grey;
    border-radius: 20px;

    font-size: 28px;

    overflow: hidden
}
.prediction-container.correct {
    border-color: green;
}
.prediction-container.in-correct {
    border-color: red;
}

.prediction-category,
.prediction-prediction {
    display: inline-block;
    padding: 20px 20px;

    text-align: center;
}
.prediction-category {
    width: 33%;
    min-width: 100px;

    background-color: #1e1f28;
}
.prediction-container img {
    position: absolute;
    top: 0px;
    right: 0px;

    height: 100px;

    object-fit: contain;
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
