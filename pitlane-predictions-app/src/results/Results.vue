<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { drivers } from '@/data/drivers.js';

const route = useRoute()

const { userId, country, year } = route.params;
const predictions = [
    {
        category: 'q_p1',
        title: 'Pole',
        prediction: 63,
        correct: null
    }, {
        category: 'p1',
        title: 'Winner',
        prediction: 63,
        correct: null
    }, {
        category: 'p2',
        title: 'P2',
        prediction: 12,
        correct: null
    }, {
        category: 'p3',
        title: 'P3',
        prediction: 16,
        correct: null
    }, {
        category: 'positions_gained_count',
        title: 'Most Positions<br>Gained',
        prediction: 8,
        correct: null
    }, {
        category: 'positions_gained_driver',
        title: 'Most Positions<br>Gained Driver',
        prediction: 3,
        correct: null
    }, {
        category: 'dnf_count',
        title: 'DNFs',
        prediction: 4,
        correct: null
    }, {
        category: 'safety_car_lap',
        title: 'Safety Car<br>by Lap',
        prediction: 20,
        correct: null
    }
];
const parsedResults = ref();
const errorMessage = ref();

axios.get(`https://api.openf1.org/v1/sessions?country_name=${country}&year=${year}`).then(sessions => {
    const qualifyingSession = sessions?.data.find(_s => _s.session_name == 'Qualifying');
    const gpSession = sessions?.data.find(_s => _s.session_name == 'Race');
    
    if (!!qualifyingSession && !!gpSession) {
        // 'Temp' hack to get around the free api throttling
        setTimeout(() => {
            Promise.all([
                axios.get(`https://api.openf1.org/v1/starting_grid?session_key=${qualifyingSession.session_key}`),
                axios.get(`https://api.openf1.org/v1/session_result?session_key=${gpSession.session_key}`),
                axios.get(`https://api.openf1.org/v1/race_control?session_key=${gpSession.session_key}&category=SafetyCar`)
            ]).then(res => {
                const startingGrid = res[0];
                const raceResult = res[1];
                const safetyCar = res[2];

                let positionsGained = null;
                let positionsLost = null;
                let firstSafetyCarLap = null;

                raceResult?.data.forEach(finishingPosition => {
                    const startingPosition = startingGrid?.data.find(_d => _d.driver_number == finishingPosition.driver_number);

                    if (finishingPosition.position && startingPosition?.position && !(finishingPosition.dnf || finishingPosition.dns)) {
                        const difference = startingPosition.position - finishingPosition.position
                        
                        if (positionsGained == null || difference > positionsGained.difference)
                            positionsGained = {
                                ...finishingPosition,
                                difference
                            };

                        if (positionsLost == null || difference < positionsLost.difference)
                            positionsLost = {
                                ...finishingPosition,
                                difference
                            };
                    }
                });

                if (!!safetyCar?.data?.length) {
                    const firstDeploy = safetyCar?.data?.find(_message => _message.message == 'SAFETY CAR DEPLOYED');

                    if (!!firstDeploy)
                        firstSafetyCarLap = firstDeploy.lap_number;
                }

                parsedResults.value = {
                    q_p1: startingGrid?.data[0]?.driver_number,
                    q_p2: startingGrid?.data[1]?.driver_number,
                    q_p3: startingGrid?.data[2]?.driver_number,
                    q_p4: startingGrid?.data[3]?.driver_number,
                    q_p5: startingGrid?.data[4]?.driver_number,
                    p1: raceResult?.data[0]?.driver_number,
                    p2: raceResult?.data[1]?.driver_number,
                    p3: raceResult?.data[2]?.driver_number,
                    p4: raceResult?.data[3]?.driver_number,
                    p5: raceResult?.data[4]?.driver_number,
                    dnf_count: raceResult?.data?.filter(_driver => _driver.dnf).length,
                    dns_count: raceResult?.data?.filter(_driver => _driver.dns).length,
                    dsq_count: raceResult?.data?.filter(_driver => _driver.dsq).length,
                    positions_gained_count: positionsGained.difference,
                    positions_gained_driver: positionsGained.driver_number,
                    positions_lost_count: positionsLost.difference,
                    positions_lost_driver: positionsLost.driver_number,
                    safety_car_lap: firstSafetyCarLap
                };

                predictions.forEach(_prediction => {
                    const { category, prediction } = _prediction;
                    const answer = parsedResults.value[category];

                    if (category == 'safety_car_lap') {
                        _prediction.correct = answer != null && prediction <= answer;
                    } else {
                        _prediction.correct = answer == prediction;
                    }
                });
            }).catch(() => {
                errorMessage.value = 'Failed to find race results';
            });
        }, 1200);
    } else {
        errorMessage.value = 'Missing required sessions';
    }
}).catch(() => {
    errorMessage.value = 'Invalid Session';
});
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
                <span class="text-container" v-html="prediction.title"></span>
            </span>
            
            <span class="prediction-prediction text-container">
                {{ drivers[prediction.prediction]?.last_name || prediction.prediction }}
            </span>

            <img v-if="!prediction.category.includes('count') && !prediction.category.includes('lap')"
                :src="`/drivers/${drivers[prediction.prediction]?.profile}`"
            />
            <!-- <span class="prediction-result">
                {{ prediction.correct ? '&#10003;' : '&#120;' }}
            </span> -->
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
