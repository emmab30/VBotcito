const BaseHandler = require('./BaseHandler');
const request = require('request');
const _ = require('lodash');
var Twitter = require('twitter');
var client = new Twitter({
  consumer_key: 'jrF81Gdk3ASteeC29Qe3wrDfP',
  consumer_secret: 'IQ2VDPPTcxFs0KB9tDoO6Cg2HbW198JuDgjs3o9oYgnZba1xWk',
  access_token_key: '3424693733-8NUvKv9yu9NCXDBRMxzDku3BJAHHIjDIO6iIuYp',
  access_token_secret: 'XSDWjVXTekop7wiTqqE4uKaD2XtRl6pwt08gS4bixEDd1'
});

class TwitterVideoHandler extends BaseHandler {
  constructor(to, text) {
    super(to, text)
  }

  // To be implemented for each function
  async getResults() {
    let text = this.text;

    let tweetID = null;
    const extractedURLS = text.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%\/.\w-]*)?\??(?:[-+=&;%@.\w]*)#?\w*)?)/gm);
    if(extractedURLS && extractedURLS.length > 0) {
      for(var idx in extractedURLS) {

        // Remove query string
        let url = extractedURLS[idx].trim();
        if(url.indexOf('?') > -1)
          url = url.split('?')[0];

        const regExp = /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\/.*)?$/g;
        var matches = regExp.exec(url);
        if(matches && matches.length > 0) {
          tweetID = _.last(matches);
          console.log(`Detected Tweet ID ${tweetID}`);
        }
      }
    }

    let promises = [];

    if(tweetID) {
      promises.push(new Promise((resolve, reject) => {
        client.get(`statuses/show/${tweetID}`, { tweet_mode: 'extended' }, (error, tweet, response) => {
          if(!error) {
            let extendedEntities = tweet.extended_entities;

            let videoFound = false;
            if(extendedEntities != null) {
              extendedEntities = extendedEntities.media;
              for(var idx in extendedEntities) {
                const entity = extendedEntities[idx];
                if(entity.type == 'video') {
                  let variants = entity.video_info.variants;
                  variants = _.orderBy(variants, ['bitrate'], ['ASC']);
                  variants = _.filter(variants, (i) => i.bitrate > 0);
                  const bestVariant = _.last(variants);
                  const urlBestVariant = bestVariant.url;

                  this.wasSuccess = true;
                  this.addResult(this.to, urlBestVariant, 'video', 0, tweet.text);

                  videoFound = true;
                  resolve();
                }
              }

              if(!videoFound) {
                this.addResult(this.to, '⭕ *No hay ningún video en ese tweet*');
                resolve()
              }
            } else {
              this.addResult(this.to, '⭕ *No hay ningún video en ese tweet*');
              resolve()
            }
          } else {
            console.log(error);
            this.addResult(this.to, '⭕ Tuve un error al buscar el video en twitter');
            resolve();
          }
        });
      }));

      const result = await Promise.all(promises);

      return this.results;
    } else {
      this.addResult(this.to, '⭕ Coloca un link válido de twitter.');

      return this.results;
    }
  }

  isValid() {
    return true;
  }
}

module.exports = TwitterVideoHandler;