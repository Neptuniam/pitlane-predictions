export const users = [
    {
        id: 0,
        first_name: 'Liam',
        last_name: 'Jones',
        league_id: '23de2-32wds-dsd23'
    }, {
        id: 1,
        first_name: 'Kathryn',
        last_name: 'Darling Jones',
        league_id: 'h3j2-h62h-fds6'
    }
]

export const leagues = [
    {
        id: '23de2-32wds-dsd23',
        name: 'First Ever Predictions League',
        users: [
            0,
            1
        ],
        categories: [
            '3231',
            '5434',
            '7645',
            '8768',
            '6453',
            '4324',
            '5636',
            '7644',
            '4234'
        ]
    },     {
        id: 'das34-g5h3-34gds',
        name: 'Matt & Tommy\'s Public League',
        users: [
            0,
            1
        ],
        categories: [
            '3231',
            '0879',
            '7568',
            '4321',
            '5535',

            '5434',
            '7645',
            '8768',
            '9786',
            '0976',
        ]
    }
];

export const predictions = [
    {
        user_id: 0,
        predictions: [
            {
                category_id: '3231',
                prediction: 63,
                correct: null
            }, {
                category_id: '5434',
                prediction: 63,
                correct: null
            }, {
                category_id: '7645',
                prediction: 12,
                correct: null
            }, {
                category_id: '8768',
                prediction: 16,
                correct: null
            }, {
                category_id: '6453',
                prediction: 'Mercedes',
                correct: null
            }, {
                category_id: '4324',
                prediction: 3,
                correct: null
            }, {
                category_id: '5636',
                prediction: 8,
                correct: null
            }, {
                category_id: '7644',
                prediction: 4,
                correct: null
            }, {
                category_id: '4234',
                prediction: 20,
                correct: null
            }
        ]
    }
];