const _today = new Date();
const _year = _today.getFullYear();

export const calendar = {
    '2026': {
        0: {
            track_id: 0,
            country: 'Australia',
            date: '2026-03-08'
        },
        1: {
            track_id: 1,
            country: 'China',
            date: '2026-03-15'
        },
        2: {
            track_id: 2,
            country: 'Japan',
            date: '2026-03-29'
        },
        3: {
            track_id: 3,
            track: 'Miami',
            country: 'United States',
            date: '2026-05-03'
        },
        4: {
            track_id: 4,
            country: 'Canada',
            date: '2026-05-24'
        },
        5: {
            track_id: 5,
            country: 'Monaco',
            date: '2026-06-07'
        },
        6: {
            track_id: 6,
            country: 'Barcelona',
            date: '2026-06-14'
        }
    }
}

export const latestEvent = Object.values(calendar[_year.toString()]).reverse().find(event => new Date(event.date) < _today);
export const nextEvent = Object.values(calendar[_year.toString()]).find(event => new Date(event.date) > _today);

export const nextEventDeadline = () => {
    if (!nextEvent?.date)
        return null;

    const today = new Date();
    const target = new Date(nextEvent.date);
    const diff = target - today;

    if (diff <= 0)
        return 'Date has passed';

    const minutes = Math.floor(diff / 1000 / 60);
    const days = Math.floor(minutes / 60 / 24);
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;

    return `${days} days, ${hours} hours, ${mins} minutes`;
};