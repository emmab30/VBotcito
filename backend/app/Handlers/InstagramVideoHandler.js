const BaseHandler = require('./BaseHandler');
const request = require('request');
const _ = require('lodash');
const youtubedl = require('youtube-dl')

// Dependencies for instagram downloading
const cheerio = require('cheerio');
const Stringify  = require('json-stringify-safe');

class InstagramVideoHandler extends BaseHandler {
  constructor(to, text) {
    super(to, text)
  }

  // To be implemented for each function
  async getResults() {
    let text = this.text;

    const extractedURLS = text.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%\/.\w-]*)?\??(?:[-+=&;%@.\w]*)#?\w*)?)/gm);

    let promises = [];
    if(extractedURLS && extractedURLS.length > 0) {
      for(var idx in extractedURLS) {
        // Remove query string
        let url = extractedURLS[idx].trim();
        if(url.indexOf('?') > -1)
          url = url.split('?')[0];

        promises.push(new Promise((resolve, reject) => {
          const isReel = url.indexOf('reel') > -1;

          if(!isReel)
            url = `${!url.endsWith('/') ? (url+'/') : url}embed`;

          console.log(`Request to ${url}`);
          const options = {
            url: url,
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4'
            }
          }

          request(options, (error, response, html) => {
            if(!error){
              try {
                if(isReel) {
                  console.log(`Its a reel: ${url}`)
                  var $ = cheerio.load(html);
                  var result = $('meta[property="og:video"]').attr('content');
                  if(result) {
                    this.addResult(this.to, result, 'video');
                  } else {
                    this.addResult(this.to, '⭕ No pude encontrar el video. Asegúrate que el perfil no sea privado.');
                  }

                  resolve()
                } else {
                  console.log(`Its a post: ${url}`)
                  // Extract betweeb "video_url" and ""
                  const beg = `"video_url":"`
                  const end = `"`
                  const matcher = new RegExp(`${beg}(.*?)${end}`,'gm');
                  const normalise = (str) => str.slice(beg.length,end.length*-1);

                  const matches = html.match(matcher);
                  if(matches && matches.length) {
                    // Check for URL
                    for(var idx in matches) {
                      let url = matches[idx];
                      url = url.replace(/\\u0026/gi, '&');
                      url = url.replace(/\u0026/gi, '&');

                      const extractedURL = url.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%\/.\w-]*)?\??(?:[-+=&;%@.\w]*)#?\w*)?)/gm);
                      if(extractedURL != null && extractedURL.length) {

                        // Try to get the title
                        const beginTitle = `"title":"`
                        const endTitle = `"`
                        const matcherTitle = new RegExp(`${beginTitle}(.*?)${endTitle}`,'gm');

                        const matchesTitle = html.match(matcherTitle);
                        let titleCaption = '';
                        if(matchesTitle && matchesTitle.length) {
                          titleCaption = matchesTitle[0];
                          titleCaption = titleCaption.replace('"title":"', "");
                          titleCaption = titleCaption.replace('"', "");
                          console.log("The title caption is", titleCaption);
                        }

                        this.addResult(this.to, extractedURL[0], 'video', 0);
                        resolve();
                      }
                    }
                  } else {
                    this.addResult(this.to, '⭕ No pude encontrar el video. Asegúrate que el perfil no sea privado.');
                    resolve(null);
                  }
                }
              } catch (err) {
                this.addResult(this.to, '⭕ No pude encontrar el video. Asegúrate que el perfil no sea privado.');
                resolve(null);
              }
            } else {
              resolve(null);
            }
          });
        }));
      }
    }

    let results = await Promise.all(promises);

    return this.results;
  }

  isValid() {
    return true;
  }
}

module.exports = InstagramVideoHandler;