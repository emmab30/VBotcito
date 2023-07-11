'use strict'

const { Command } = require('@adonisjs/ace')
const Whappme = use('App/Helpers/Whappme');
const request = use('request');

class SendMessage extends Command {
  static get signature () {
    return 'send:message'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {
    const body = {
      "to": "5493516873147",
      "content": {
        "type": "text",
        "url": "hola.com"
      }
    }

    let promises = [];

    promises.push(new Promise((resolve, reject) => {
      request({
        method: 'POST',
        uri: 'http://127.0.0.1:5000/webhooks/new_message',
        form: body,
        json: true
      }, (err, data) => {
        if(!err) {
          this.success(`Executed command successfully: ${data.statusCode}`);
          resolve(true);
        } else {
          this.success(`Error: something were wrong`);
          console.log(err);
          reject();
        }
      })
    }));

    let waitForReplies = await Promise.all(promises);
    return true;
  }
}

module.exports = SimulateMessage
