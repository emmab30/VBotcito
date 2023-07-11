const BaseHandler = require('./BaseHandler');
const _ = require('lodash');

const quoteFiles = ['../../quotes/misc.json', '../../quotes/philosophy.json'];

class PhraseHandler extends BaseHandler {
  constructor(to, text) {
    super(to, text)

    // Extra fields
    this.quotes = [];
    this.loadQuotes();
  }

  // To be implemented for each function
  getResults() {
    let text = this.text;

    // Process
    const sampleQuote = _.sample(this.quotes);
    text = `👉 ${sampleQuote.quote}`;
    if(sampleQuote.author && sampleQuote.author.trim() && sampleQuote.author.trim().length > 0) {
      text += `\n\n*${sampleQuote.author}*`;
    }

    this.text = text;

    // Add the result
    this.addResult(this.to, this.text);

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

module.exports = PhraseHandler;