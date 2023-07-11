const _ = require('lodash');
const DailyHoroscope = require('../Models/DailyHoroscope');

module.exports = class BaseHandler {
  constructor(to, text, parameters = null) {
    this.to = to;
    this.text = text;
    this.parameters = parameters;
    this.results = []; // This is an array to response the messages to be replied
    this.wasSuccess = false; // Returns true if the handler detection was success
  }

  static getHandler(to, text, dialogFlowResponse) {
      console.log("hoLA JAJA", to, text);
    if(to && text) {
      console.log(`Detected intent: ${dialogFlowResponse.intent}`);

      let handler;

      const simpsonsPatterns = ['simpsons', 'homero', 'bart', 'homer', 'lisa', 'marge', 'moe'];
      const rememberPatterns = ['recuerda', 'recuérdame', 'record', 'recordar', 'recordarme', 'recordame', 'recorda', '!rm'];

      // Horoscopes patterns
      const patterns = _.map(DailyHoroscope.getSigns(), 'pattern');
      const horoscopePatterns = ['horoscopo', 'horoscop', ...patterns];

      if(dialogFlowResponse.intent == 'Reminder Creation' ||
        _.some(rememberPatterns, (i) => text.toLowerCase().indexOf(i) > -1)) { // Reminders
        handler = require('./ReminderHandler');
      } else if(
        dialogFlowResponse.intent == 'Horoscope' && _.some(horoscopePatterns, (i) => text.toLowerCase().indexOf(i) > -1)) { // Horoscopes
        handler = require('./HoroscopeHandler');
      } else if(text.toLowerCase().indexOf('frase') > -1) { // Frases
        handler = require('./PhraseHandler');
      } else if(simpsonsPatterns.indexOf(text.toLowerCase()) > -1) { // Simpsons
        handler = require('./PhraseSimpsonsHandler');
      } else if(text.toLowerCase().indexOf('twitter') > -1) { // Twitter
        handler = require('./TwitterVideoHandler');
      } else if(text.toLowerCase().indexOf('instagram') > -1) { // Instagram
        handler = require('./InstagramVideoHandler');
      } else if(text.toLowerCase().indexOf('youtube') > -1 || text.toLowerCase().indexOf('youtu.be') > -1) { // Youtube
        handler = require('./YoutubeVideoHandler');
      } else {
        handler = require('./UnknownHandler');
      }

      if(handler){
        const retVal = new handler(to, text, dialogFlowResponse != null ? dialogFlowResponse.parameters : null, dialogFlowResponse);
        return retVal;
      }

      return null;
    }
  }

  // To be implemented for each subclass
  isValid() {
    return true;
  }

  async getResults() {
    // To Do
  }

  addResult(to, text, type = 'text', delaySeconds = 0, caption = '') {
    let obj = {
      to,
      text,
      type,
      delaySeconds,
      caption
    };

    this.results.push(obj);
    return obj;
  }

  wasSuccess() {
    return this.wasSuccess;
  }
}