const BaseHandler = require('./BaseHandler');
const _ = require('lodash');
const DailyHoroscope = use('App/Models/DailyHoroscope');

class HoroscopeHandler extends BaseHandler {
  constructor(to, text) {
    super(to, text)
  }

  // To be implemented for each function
  async getResults() {
    let text = this.text;

    // Check horoscope based on text
    const signs = DailyHoroscope.getSigns();
    for(var idx in signs) {
        const sign = signs[idx];
        if(text.toLowerCase().indexOf(sign.pattern) > -1) {
            let horoscope = await DailyHoroscope
                .query()
                .where('sign', sign.id)
                .first();

            if(horoscope) {
                let text = `🥳 *Horoscopo del día para ${sign.id}*`;
                text += `\n\n ${horoscope.text}`;

                this.addResult(this.to, text, 'text', 0);
            }
        }
    }

    return this.results;
  }

  isValid() {
    return true;
  }
}

module.exports = HoroscopeHandler;