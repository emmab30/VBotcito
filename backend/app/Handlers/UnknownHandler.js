const BaseHandler = require('./BaseHandler');
const _ = require('lodash');

class UnknownHandler extends BaseHandler {
  constructor(to, text) {
    super(to, text)
  }

  // To be implemented for each function
  getResults() {
    let text = this.text;

    if(text && text.indexOf('facebook') > -1) {
      this.addResult(this.to, '🥺 Disculpa, aún estoy trabajando para hacer eso.');
    }

    return this.results;
  }

  isValid() {
    return true;
  }
}

module.exports = UnknownHandler;