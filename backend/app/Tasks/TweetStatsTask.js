"use strict";

// Models and helpers
const Reminder = use('App/Models/Reminder');
const Logger = use('App/Helpers/Logger');
const Whappme = use('App/Helpers/Whappme');

// Dependencies
const Task = use("Task");
const moment = require('moment');

class TweetStatsTask extends Task {
  static get schedule() {
    const interval = "0 */12 * * *" // Every 12 hours
    // const interval = "* * * * *"; // Every 1 minute
    return interval;
  }

  async handle() {
    return;

    // Configure twitter
    const Twitter = require('twitter');
    const Env = use('Env');

    var client = new Twitter({
      consumer_key: Env.get('TWITTER_CONSUMER_KEY'),
      consumer_secret: Env.get('TWITTER_CONSUMER_SECRET'),
      access_token_key: Env.get('TWITTER_ACCESS_TOKEN_KEY'),
      access_token_secret: Env.get('TWITTER_ACCESS_TOKEN_SECRET')
    });

    const Reminder = use('App/Models/Reminder');
    const remindersQty = await Reminder
      .query()
      // .where('was_reminded', 0)
      .getCount('id');

    client.post('statuses/update', {
      status: `🔔 Ya me han pedido recordar ${remindersQty} cosas hasta ahora. \n\n ¡Pedime que te recuerde algo, y no te olvidarás de nada nunca más! 🕺💃`
    },  (error, tweet, response) => {
      if(error) throw error;
      console.log(`Posted a tweet on my own account @vbotcito: 200 OK`);
    });
  }
}

module.exports = TweetStatsTask;
