const BaseHandler = require('./BaseHandler');
const request = require('request');
const _ = require('lodash');
const fs = require('fs');
const youtubedl = require('youtube-dl')

class YoutubeVideoHandler extends BaseHandler {
  constructor(to, text) {
    super(to, text)
  }

  // To be implemented for each function
  async getResults() {
    let text = this.text;

    let youtubeURL = null;
    const extractedURLS = text.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%\/.\w-]*)?\??(?:[-+=&;%@.\w]*)#?\w*)?)/gm);
    if(extractedURLS && extractedURLS.length > 0) {
      for(var idx in extractedURLS) {

        // Remove query string
        const url = extractedURLS[idx].trim();
        if(url && url.length) {
          youtubeURL = url;
          console.log(`Detected Youtube URL ${youtubeURL}`);
        }
      }
    }

    let promises = [];

    let videoTitle = null;
    if(youtubeURL) {
      promises.push(new Promise((resolve, reject) => {

        // Check if we need to parse the text or the audio
        if(text.indexOf('song') > -1) {

          // Extract the audio from the video ussing FFMPEg
          const destFolder = `public/downloads`
          const fileID = new Date().getTime();
          const outputFile = `${fileID}.mp4`; // If the format is mp3, then ffmpeg won't process the conversion
          const destFile = `${destFolder}/${outputFile}`

          console.log(`Initializing youtube downloader..`);
          youtubedl.exec(youtubeURL, ['-x', '--audio-format', 'mp3', '-o', destFile, '--verbose'], {}, (err, output) => {
            if (err) {
              console.log(`Error with youtubedl library`, err);
              resolve(true);
            } else {
              const apiRequestAudioURL = `https://sample.phraseame.whappme.com/download/audio/${fileID}`;
              this.addResult(this.to, apiRequestAudioURL, 'audio')
              resolve(true);
            }
          });
        } else {
          youtubedl.getInfo(youtubeURL, [], (err, info) => {
            if(!info || !info.fulltitle) {
              this.addResult(this.to, 'Algo pasó y no puedo obtener ese video. Quizás puedas volver a intentar en unos momentos..', 'text');
              resolve(null)
            } else if(err || !info){
              this.addResult(this.to, `¡Disculpa! No puedo conseguir ese video *${videoTitle}*. Inténtalo de nuevo en unos momentos`, 'text');
              resolve(null)
            } else {
              const videoTitle = info.fulltitle != null ? info.fulltitle : info.title;

              const FILE_BYTES_LIMIT = 75000000;

              // Check duration
              if(info._duration_raw > 1500) {
                this.addResult(this.to, `¡Disculpa! Ese video es demasiado largo. El máximo que permito es de 25 minutos.`);

                if(text.indexOf('link') > -1) {
                  this.wasSuccess = true;
                  this.addResult(this.to, info.url);
                }
                resolve(null);
              } else if(!info.filesize || info.filesize >= FILE_BYTES_LIMIT){

                request({
                  method: 'HEAD',
                  uri: info.url
                }, (err, response) => {
                  // Get content length and check if the length is able.
                  let contentLength = response.headers['content-length'];
                  if(contentLength) {
                    contentLength = parseInt(contentLength);
                    if(contentLength <= FILE_BYTES_LIMIT) {
                      this.wasSuccess = true;
                      this.addResult(this.to, info.url, 'video', 0, info.fulltitle);
                    } else {
                      this.addResult(this.to, `¡Disculpa! El video es muy pesado. [Max allowed: ${parseInt(FILE_BYTES_LIMIT / 1000000)}MB, Current: ~${parseInt(contentLength / 1000000)}MB]`);
                    }
                  }

                  if(text.indexOf('link') > -1) {
                    this.wasSuccess = true;
                    this.addResult(this.to, info.url);
                  }
                  resolve(null);
                });
              } else {
                // Check if it's the audio URL or the video url
                this.wasSuccess = true;
                this.addResult(this.to, info.url, 'video', 0, info.fulltitle);
                resolve(true);
              }
            }
          });
        }
      }));

      const result = await Promise.all(promises);
    }

    return this.results;
  }

  isValid() {
    return true;
  }
}

module.exports = YoutubeVideoHandler;