import axios from 'axios';

import { drivers } from '@/data/drivers.js';
import { teams } from '@/data/teams.js';
import { categories } from '@/data/categories.js';
import { users, leagues, predictions } from './config.js';

export const fetchUserInfo = (userId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                user: users.find(_user => _user.id == userId),
                leagues: leagues.filter(_league => _league.users.includes(+userId)).map(_league => ({
                    ..._league,
                    users: _league.users.map((_userId, index) => ({
                        ...users.find(__user => __user.id == _userId),
                        points: Math.ceil(Math.floor(Math.random() * (8 - 1 + 1) + 1) * ((_league.users.length - index) * 1.5))
                    })).sort((a, b) => b.points - a.points).map((_user, index) => ({
                        ..._user,
                        position: index + 1
                    }))
                }))
            });
        }, 100);
    });
}

export const fetchPredictions = (userId, country, year) => {
    const userPredictions = predictions.find(_predictions => _predictions.user_id == userId);

    if (!userPredictions)
        throw new Error ('Could not find user predictions');

    const pointsPositions = [ 25, 18, 15, 12, 10, 8, 6, 4, 2, 1 ];

    return axios.get(`https://api.openf1.org/v1/sessions?country_name=${country}&year=${year}`).then(async sessions => {
        const qualifyingSession = sessions?.data.find(_s => _s.session_name == 'Qualifying');
        const gpSession = sessions?.data.find(_s => _s.session_name == 'Race');
        
        if (!!qualifyingSession && !!gpSession) {
            // 'Temp' hack to get around the free api throttling
            await new Promise(resolve => setTimeout(resolve, 1200));

            return Promise.all([
                axios.get(`https://api.openf1.org/v1/starting_grid?session_key=${qualifyingSession.session_key}`),
                axios.get(`https://api.openf1.org/v1/session_result?session_key=${gpSession.session_key}`),
                axios.get(`https://api.openf1.org/v1/race_control?session_key=${gpSession.session_key}&category=SafetyCar`)
            ]).then(res => {
                const startingGrid = res[0];
                const raceResult = res[1];
                const safetyCar = res[2];

                let positionsGained = null;
                let positionsLost = null;
                let pointCountByTeam = {};
                let highestPointTeam = null;

                raceResult?.data.forEach(finishingPosition => {
                    const driver = drivers[finishingPosition.driver_number];
                    
                    if (!!driver && !(driver.team in pointCountByTeam))
                        pointCountByTeam[driver.team] = 0;

                    const startingPosition = startingGrid?.data.find(_d => _d.driver_number == finishingPosition.driver_number);

                    if (finishingPosition.position && startingPosition?.position && !(finishingPosition.dnf || finishingPosition.dns)) {
                        if (!!driver && finishingPosition.position < 11)
                            pointCountByTeam[driver.team] += pointsPositions[finishingPosition.position-1];

                        const difference = startingPosition.position - finishingPosition.position;
                        
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

                for (const [team, points] of Object.entries(pointCountByTeam)) {
                    if (highestPointTeam == null || highestPointTeam.points < points)
                        highestPointTeam = { team, points };
                }
                
                const parsedResults = {
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
                    fastest_lap_driver: null,
                    fastest_pitstop_team: null,
                    most_points_team: highestPointTeam?.team,
                    dnf_count: raceResult?.data?.filter(_driver => _driver.dnf).length,
                    dns_count: raceResult?.data?.filter(_driver => _driver.dns).length,
                    dsq_count: raceResult?.data?.filter(_driver => _driver.dsq).length,
                    positions_gained_count: positionsGained.difference,
                    positions_gained_driver: positionsGained.driver_number,
                    positions_lost_count: positionsLost.difference,
                    positions_lost_driver: positionsLost.driver_number,
                    safety_car_lap: safetyCar?.data?.find(_message => _message.message == 'SAFETY CAR DEPLOYED')?.lap_number || null,
                    safety_car_Count: safetyCar?.data?.filter(_message => _message.message == 'SAFETY CAR DEPLOYED')?.length || 0
                };

                console.log('parsedResults', parsedResults);

                return userPredictions.predictions.map(_prediction => {
                    const category = categories.find(_category => _category.id == _prediction.category_id);
                    const answer = parsedResults[category.key];

                    let correct = false;
                    let profile = null;

                    if (category.key == 'safety_car_lap') {
                        correct = answer != null && answer <= _prediction.prediction;
                    } else {
                        correct = answer == _prediction.prediction;
                    }

                    if (category.type == 'driver' && !category.key.includes('count')) {
                        profile = `/drivers/${drivers[_prediction.prediction]?.profile}`
                    } else if (category.type == 'team') {
                        profile = `/teams/${teams[_prediction.prediction]?.profile}`
                    }

                    return {
                        id: category.id,
                        key: category.key,
                        title: category.title,
                        type: category.type,
                        points: category.points,
                        prediction: _prediction.prediction,
                        correct,
                        profile
                    }
                });
            }).catch(e => {
                console.error(e);
                throw new Error('Failed to find race results');
            });
        } else {
            throw new Error('Missing required sessions');
        }
    }).catch(e => {
        console.error(e);
        throw new Error('Invalid Session');
    });
}