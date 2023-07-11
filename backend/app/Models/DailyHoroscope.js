'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyHoroscope extends Model {
    static getSigns() {
        const signs = [
            { id: 'aries', pattern: 'aries' },
            { id: 'taurus', pattern: 'taur' },
            { id: 'gemini', pattern: 'gem' },
            { id: 'cancer', pattern: 'cer' },
            { id: 'leo', pattern: 'leo' },
            { id: 'virgo', pattern: 'virgo' },
            { id: 'libra', pattern: 'libra' },
            { id: 'scorpio', pattern: 'scorp' },
            { id: 'sagittarius', pattern: 'sagit' },
            { id: 'capricorn', pattern: 'capri' },
            { id: 'pisces', pattern: 'pis' },
            { id: 'aquarius', pattern: 'acu' }
        ];

        return signs;
    }
}

module.exports = DailyHoroscope