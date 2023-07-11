'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MarMerchanMessage extends Model {
    static get table () {
        return 'mar_merchan_messages'
    }
}

module.exports = MarMerchanMessage