'use strict'

const Logger = use('App/Helpers/Logger');
const Whappme = use('App/Helpers/Whappme');
const Message = use('App/Models/Message');
const Conversion = use('App/Models/Conversion');
const BaseHandler = use('App/Handlers/BaseHandler');

// Dependencies
const fs = require('fs');
const _ = require('lodash');
const request = require('request');
const uuid = require('uuid');
const dialogflow = require('@google-cloud/dialogflow');

class DownloadController {
  async downloadAudio({ request, response }) {
    const audioID = request.params.id;
    console.log(`Requesting audio ID`, audioID);

    let filePath = `public/downloads/${audioID}.mp3`;
    if(fs.existsSync(filePath)){
      setTimeout(() => {
        fs.unlink(filePath, () => {
          console.log(`Deleted file from downloads folder`);
        });
      }, 30000);

      const stat = fs.statSync(filePath);
      response.response.writeHead(200, {
        'Content-Type': 'audio/mp3',
        'Content-Length': stat.size
      });

      var readStream = fs.createReadStream(filePath);
      readStream.pipe(response.response);
    } else {
      response.status(200);
    }

    return response.json({
      success: true
    });
  }
}

module.exports = DownloadController
