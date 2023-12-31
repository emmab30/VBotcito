'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class TweetVideo extends Model {
    static get table () {
        return 'twitter_videos'
    }
}

module.exports = TweetVideo
