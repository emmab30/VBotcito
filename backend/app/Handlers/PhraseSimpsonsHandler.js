const BaseHandler = require('./BaseHandler');
const request = require('request');
const _ = require('lodash');

const quoteFiles = ['../../quotes/misc.json', '../../quotes/philosophy.json'];

class PhraseSimpsonsHandler extends BaseHandler {
  constructor(to, text) {
    super(to, text)
  }

  // To be implemented for each function
  async getResults() {
    let text = this.text;

    let promises = [];
    promises.push(new Promise((resolve, reject) => {
      request({
        method: 'GET',
        uri: 'https://los-simpsons-quotes.herokuapp.com/v1/quotes'
      }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          const quote = JSON.parse(body)[0];

          resolve(quote);
        } else {
          resolve(null)
        }
      })
    }));

    let results = await Promise.all(promises)
    if(results && results[0]) {
      let quote = results[0];
      let text = `👶 _${quote.quote}_`;
      text += `\n\n*${quote.author}*`;

      this.text = text;

      this.addResult(this.to, this.text);
    }

    return this.results;
  }

  isValid() {
    return true;
  }

  // Extra functions
  loadQuotes() {
    // Quotes
    var quotes = [];
    for(var idx in quoteFiles) {
      let quoteCategory = '';
      if(quoteFiles[idx].indexOf('misc') > -1) {
        quoteCategory = 'Misc';
      } else if(quoteFiles[idx].indexOf('philosophy') > -1) {
        quoteCategory = 'Philosophy';
      }

      quotes = quotes.concat(
        _.map(require(`${quoteFiles[idx]}`), (quote) => {
          return {
            ...quote,
            category: quoteCategory
          }
        })
      );
    }

    this.quotes = quotes;
  }
}

module.exports = PhraseSimpsonsHandler;