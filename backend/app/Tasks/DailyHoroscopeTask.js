"use strict";

// Models and helpers
const Reminder = use('App/Models/Reminder');
const DailyHoroscope = use('App/Models/DailyHoroscope');
const Logger = use('App/Helpers/Logger');
const Whappme = use('App/Helpers/Whappme');

// Dependencies
const _ = require('lodash');
const Task = use("Task");
const moment = require('moment');
const request = require('request');

class DailyHoroscopeTask extends Task {
    static get schedule() {
        const interval = "0 */4 * * *" // Every 12 hours
        return interval;
    }

    async handle() {
        this.crawl();
    }

    async crawl() {
        Logger.log(`Starting daily horoscope crawler`);

        request({
            method: 'GET',
            uri: `https://horoscopefree.herokuapp.com/daily/es/`
        }, async (err, response) => {
            const signs = DailyHoroscope.getSigns();
            if(!err && response.statusCode == 200) {
                let { body } = response;
                body = JSON.parse(body);

                const keys = Object.keys(body);
                for(var idx in keys) {
                    if(_.some(signs, i => i.id == keys[idx])) {
                        const text = body[keys[idx]];
                        
                        await DailyHoroscope
                            .query()
                            .where('sign', keys[idx])
                            .update({
                                sign: keys[idx],
                                text: text
                            });
                    }
                }
            }
        });
    }
}

module.exports = DailyHoroscopeTask;