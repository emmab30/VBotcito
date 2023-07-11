'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MarMerchanNumber extends Model {
    static get table () {
        return 'mar_merchan_numbers'
    }
}

module.exports = MarMerchanNumber