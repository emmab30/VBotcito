const BaseHandler = require('./BaseHandler');
const request = require('request');
const _ = require('lodash');
const fs = require('fs');
var url = require('url');
var crypto = require('crypto');
const youtubedl = require('youtube-dl')

var serviceOptions = {
  host: 'identify-eu-west-1.acrcloud.com',
  endpoint: '/v1/identify',
  signature_version: '1',
  data_type:'audio',
  secure: true,
  access_key: '3be4fabd76b0f654ebf05304d51ed120',
  access_secret: 'hbt8yInMXKE7jczYWc3svW6tZNZFYcVoPpAqoshA'
};

class AudioMusicRecognitionHandler extends BaseHandler {
  constructor(to, text) {
    super(to, text)
  }

  // To be implemented for each function
  async getResults() {
    let audioURL = this.text;

    let promises = [];
    promises.push(new Promise((resolve, reject) => {
      request({ url: audioURL, encoding: null }, (err, resp, buffer) => {
        // Identifying the buffer audio

        console.log(`Identifying the buffer audio to know if there is some sound behind.`);

        identify(buffer, serviceOptions, (err, httpResponse, body) => {

          console.log(`Response from acrcloud: ${body}`)

          if(err) {
            this.addResult(this.to, `Sorry! 😖 We don't have any song with that pattern`);
            resolve(false);
          } else {
            body = JSON.parse(body);
            if(body.status.code == 0) { // The recognition was successfuly!

              const music = body.metadata.music[0];

              let text = ``;

              text += `🎤 Song title: *${music.title}*`;
              if(music.album && music.album.name)
                text += `\n\n📀 Album: *${music.album.name}*`
              if(music.artists && music.artists.length)
                text += `\n\n🕺 Author: *${music.artists[0].name}*`
              if(music.genres && music.genres.length)
                text += `\n\n🎵 Genre: *${music.genres[0].name}*`

              this.addResult(this.to, text);

              resolve(true);
            } else {
              this.addResult(this.to, `Sorry! 😖 We don't have any song with that pattern`);

              resolve(false);
            }
          }
        });
      });
    }));

    let results = await Promise.all(promises);

    return this.results;
  }

  isValid() {
    return true;
  }
}

/* Functions to identify a song */
function buildStringToSign(method, uri, accessKey, dataType, signatureVersion, timestamp) {
  return [method, uri, accessKey, dataType, signatureVersion, timestamp].join('\n');
}

function sign(signString, accessSecret) {
  return crypto.createHmac('sha1', accessSecret)
    .update(Buffer.from(signString, 'utf-8'))
    .digest().toString('base64');
}

/**
 * Identifies a sample of bytes
 */
function identify(data, options, cb) {

  var current_data = new Date();
  var timestamp = current_data.getTime()/1000;

  var stringToSign = buildStringToSign('POST',
    options.endpoint,
    options.access_key,
    options.data_type,
    options.signature_version,
    timestamp);

  var signature = sign(stringToSign, options.access_secret);

  var formData = {
    sample: data,
    access_key:options.access_key,
    data_type:options.data_type,
    signature_version:options.signature_version,
    signature:signature,
    sample_bytes:data.length,
    timestamp:timestamp,
  }
  request.post({
    url: "http://"+options.host + options.endpoint,
    method: 'POST',
    formData: formData
  }, cb);
}

module.exports = AudioMusicRecognitionHandler;