const Feedback = use('App/Models/Feedback');
const request = require('request');

// Credentials
/* const WHAPPME_API_KEY = `50808489-281a-4208-8853-e0d77a705d80`;
const WHAPPME_SECRET_KEY = `4997d6e6-3799-4bef-a21d-3e83b108ee49`; */
const WHAPPME_API_KEY = `a073fa8d-7c10-49ec-8d3f-bba63f355ceb`;
const WHAPPME_SECRET_KEY = `82934d16-f30c-47b2-941e-f8e0e238f086`;

class Whappme {
  static sendMessage(to, text, delaySeconds) {

    /* setTimeout(() => { */
      return request({
        method: 'POST',
        uri: `https://api.whappme.com/api/v1/messaging/send/text`,
        json: {
          to: to,
          text: text
        },
        headers: {
          'x-api-key': WHAPPME_API_KEY,
          'x-secret-key': WHAPPME_SECRET_KEY,
        }
      });
    /* }, delaySeconds * 1000); */
  }
  
  static sendVideo(to, url, title = '') {
    request({
      method: 'POST',
      uri: `https://api.whappme.com/api/v1/messaging/send/media`,
      json: {
        to: to,
        type: 'video',
        caption: `${title}`,
        url: url
      },
      headers: {
        'x-api-key': WHAPPME_API_KEY,
        'x-secret-key': WHAPPME_SECRET_KEY,
      }
    })
  }

  static sendSticker(to, url) {
    request({
      method: 'POST',
      uri: `https://api.whappme.com/api/v1/messaging/send/media`,
      json: {
        to: to,
        type: 'sticker',
        url: url
      },
      headers: {
        'x-api-key': WHAPPME_API_KEY,
        'x-secret-key': WHAPPME_SECRET_KEY,
      }
    })
  }
  
  static sendAudio(to, url) {
    request({
      method: 'POST',
      uri: `https://api.whappme.com/api/v1/messaging/send/media`,
      json: {
        to: to,
        type: 'audio',
        url: url
      },
      headers: {
        'x-api-key': WHAPPME_API_KEY,
        'x-secret-key': WHAPPME_SECRET_KEY,
      }
    })
  }

  static async notifyNewFeatures(to) {
    const newFeatureText = `🤩 *NUEVO* ¿Sabías que ahora podés saber tu horoscopo diario? Solo escribí tu signo y te lo envío! Ejemplo: _sagitario_`;
    // Check if we could ask for feedback
    let count = await Feedback
      .query()
      .where('number', to)
      .getCount('id');

    if(count == 0) {
      Whappme.sendMessage(to, newFeatureText, 5);
      Feedback.create({
        number: to
      });
    }
  }
}

module.exports = Whappme;