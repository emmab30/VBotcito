'use strict'

const Logger = use('App/Helpers/Logger');
const Whappme = use('App/Helpers/Whappme');
const Message = use('App/Models/Message');
const Conversion = use('App/Models/Conversion');
const Redeem = use('App/Models/Redeem');
const Reminder = use('App/Models/Reminder');
const Number = use('App/Models/Number');
const TweetVideo = use('App/Models/TweetVideo');
const BaseHandler = use('App/Handlers/BaseHandler');

// Dependencies
const fs = require('fs');
const _ = require('lodash');
const request = require('request');
const uuid = require('uuid');
const dialogflow = require('@google-cloud/dialogflow');

class WebsiteController {
  async getByTwitterUsername({ request, response }) {
    const username = request.params.username;
    const videos = await TweetVideo
      .query()
      .where('twitter_username', username)
      .orderBy('created_at', 'DESC')
      .fetch();

    return response.json({
      success: true,
      videos
    });
  }

  async getLastContentRedeemed({ request, auth, response }) {
    let params = request.all();
    let content = await Redeem
      .query()
      .limit(params.limit)
      .offset(params.limit * params.page)
      .orderByRaw('RAND()')
      .where('was_redeemed', 1)
      .where('flags', '<', 2)
      .fetch();

    let items = [];

    if(content) {
      content = content.toJSON();

      for(var idx in content) {
        const item = content[idx];
        if(item) {
          const payload = JSON.parse(item.results);
          items.push({
            type: payload.type,
            url: payload.url,
            code: item.code
          });
        }
      }
    }
    
    return response.json({
      success: true,
      content: {
        items
      }
    })
  }

  async getRemindersByPrivateCode({ request, response }) {
    const privateCode = request.params.private_code;
    let number = await Number
      .query()
      .where('private_code', privateCode)
      .first();

    if(number) {
      number = number.toJSON();

      const reminders = await Reminder
        .query()
        .where('number', number.number)
        .where('was_reminded', 0)
        .where('is_deleted', 0)
        .orderBy('created_at', 'ASC')
        .fetch();

      return response.json({
        success: true,
        reminders
      });
    }
    
    return response.json({
      success: true,
      reminders: []
    });
  }
}

module.exports = WebsiteController
