'use strict'

const Logger = use('App/Helpers/Logger');
const Whappme = use('App/Helpers/Whappme');
const Number = use('App/Models/Number');
const Message = use('App/Models/Message');
const Conversion = use('App/Models/Conversion');
const Redeem = use('App/Models/Redeem');
const Feedback = use('App/Models/Feedback');
const BaseHandler = use('App/Handlers/BaseHandler');

// Test
const MarMerchanMessage = use('App/Models/MarMerchanMessage');
const MarMerchanNumber = use('App/Models/MarMerchanNumber');

// Dependencies
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const sharp = require('sharp');
const axios = require('axios');
const nanoId = require('nanoid');
const crypto = require('crypto')
const _ = require('lodash');
const request = require('request');
const uuid = require('uuid');
const dialogflow = require('@google-cloud/dialogflow');
const { options } = require('@adonisjs/ace/src/Command');
const path = require('path');
const tmpFolder = path.join(__dirname, '../../../', 'tmp');

// Initialize firebase
const admin = require('firebase-admin');
const serviceAccount = require(path.join(__dirname, '../../../', 'private', 'pkhere.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://phraseame-vebs.firebaseio.com",
  storageBucket: "phraseame-vebs.appspot.com"
});

class WebhookController {

  /* // Test functions
  async onReceivedMessageMarMerchan({ request, response }) {
    const data = request.all();

    if(data.content.text.includes('1')) {
        let number = await MarMerchanNumber
            .query()
            .where('number', data.from)
            .where('replied_call', 0)
            .first();

      number = number.toJSON();

      if(number != null) {
        await Whappme.sendMessage(number.number, `*Ya guardamos tu respuesta ✅ ✅*\r\n\r\nTe llamaremos en los próximos días.\r\n\r\n¡Nuevamente, muchas gracias por tu tiempo! 😊`);
        await MarMerchanNumber
          .query()
          .where('number', number.number)
          .update({
            replied_call: 1
          });
      }
    }

    return response.json({
      success: true
    });
  } */

  async sendMessages({ request, response }) {
    let numbers = await MarMerchanNumber
      .query()
      .fetch();

    numbers = numbers.toJSON();

    for(var idx in numbers) {
      const number = numbers[idx];
      await Whappme.sendMessage(number.number, `*Hola ${number.name}* ¡Buenas tardes!\r\n\r\nEn el 2020/2021 accediste al servicio de Mediación Comunitaria del Defensor del Pueblo de la Provincia de Córdoba y es por eso que queremos escuchar tu valiosa opinión en cuanto a la experiencia vivida. Desde el Centro de Mediación nos encontramos realizando un trabajo de investigación cuyo objetivo es analizar el vínculo de la mediación comunitaria con el desarrollo humano, y a partir de ello continuar creciendo y mejorando para la comunidad.\r\nEs por eso que nos interesa conocer cómo fue tu experiencia, y por eso te pedimos que respondas el breve cuestionario que te compartimos a continuación, el cual *no te llevará más de 5 minutos*: https://shorti.io/Vw5ve4/wp\r\n\r\nPara que te sientas con libertad de responder, te contamos que *TU RESPUESTA ES ANÓNIMA Y CONFIDENCIAL*\r\n\r\n¡Muchísimas gracias por tu tiempo!\r\n\r\n*En caso que prefieras responder esta breve encuesta de manera telefónica, te pedimos que respondas este chat marcando el número 1 y nos estaremos comunicando contigo en los próximos días.*`);

      await MarMerchanNumber
          .query()
          .where('number', number.number)
          .update({
            sent_message: 1
          });
    }
    return response.json({
      success: true
    });
  }

  async onReceivedMessage({ request, response }) {
    const data = request.all();
    console.log("Holiiiii");

    // Extract variables from response
    let {
      is_group: isGroup,
      from: number,
      content: {
        text: query,
        audio_url: audioURL,
        image_url: imageURL,
        video_url: videoURL,
        caption,
        is_gif: isGIF
      }
    } = data;

    // Save the number and generate an unique ID
    const numberQuery = Number
      .query()
      .where('number', number);

    const countNumber = await numberQuery.getCount('id');
    if(countNumber == 0) {
      const uniqueId = nanoId.nanoid(6);
      Logger.log(`Created number into database with private code ${uniqueId}`)
      await Number
        .create({
          number: number,
          private_code: uniqueId
        });
    }

    // Fallback
    await Whappme.sendMessage(number, `❗ Estamos fuera de servicio (We're out of service). Sígueme en Twitter para saber cuando reactivaremos: https://twitter.com/eabuslaiman_`);
    return response.json({
      success: true
    });

    const messageType = this.getMessageType(data);
    // Check against dialogflow and get possible intent
    let responseDialogFlow;


    if(messageType == Message.TYPES.TEXT) {
      responseDialogFlow = await this.getIntentDialogFlow(number, query, 'text')
    } else if(messageType == Message.TYPES.AUDIO) {
      responseDialogFlow = await this.getIntentDialogFlow(number, audioURL, 'audio')
    } else if(messageType == Message.TYPES.VIDEO) {

      // Send sticker in video format (animated)
      /* await Whappme.sendMessage(number, `❗ ¿Quieres hacer stickers animados cierto? Aún estoy trabajando en eso.. te avisaré pronto!`) */
      if(true || isGIF) {
        const video = videoURL;

        // Save buffer to video
        axios.get(video, { responseType: 'arraybuffer' })
          .then(async response => {
            let bufferLength = Buffer.byteLength(response.data);
            const bufferInMB = bufferLength / 1000000;
            if(bufferInMB > 3) {
              await Whappme.sendMessage(number, '❗ El archivo es muy pesado para el sticker que quieres hacer. Asegúrate que sea un video rápido y corto 🏃‍♂️🏃‍♂️')
              return null;
            }

            return Buffer.from(response.data, 'binary')
          })
          .then(async (buffer) => {
            if(!buffer)
              return null;

            const systemFileName = nanoId.nanoid(8);
            fs.writeFile(`${tmpFolder}/${systemFileName}.mp4`, buffer, async () => {
              var inFilename = `${tmpFolder}/${systemFileName}.mp4`;
              var outFilename = `${tmpFolder}/${systemFileName}.gif`;

              ffmpeg(inFilename)
                .outputOption("-vf", "scale=320:-1:flags=lanczos,fps=10")
                .outputOption("-t", "4")
                .save(outFilename)
                .on('end', (async () => {
                  const folder = 'stickers';
                  const fileName = `${nanoId.nanoid(10)}.webp`;
                  var imageBuffer = await sharp(outFilename, { pages: -1 })
                    .webp({ lossless: false })
                    .toBuffer();
                  
                  var bucket = admin.storage().bucket();
                  const file = bucket.file(`${folder}/${fileName}`);

                  let promises = [];
                  promises.push(new Promise((resolve, reject) => {
                      file.save(
                          imageBuffer,
                          {
                              resumable: false,
                              metadata: { contentType: "image/webp" }
                          },
                          (err) => {
                              if(!err) {
                                  file.getSignedUrl({
                                      action: 'read',
                                      expires: '03-09-2500',
                                  }, (err, url) => {
                                      if(!err){
                                        Logger.log(`Removing temp files from file system`);
                                        Logger.log(`URL for sticker: ${url}`);
                                        fs.unlink(inFilename, () => null);
                                        fs.unlink(outFilename, () => null);

                                        resolve(url)
                                      } else {
                                        reject(err);
                                      }
                                  })
                              }
                          });
                  }));

                  const response = await Promise.all(promises);

                  if(response && response.length > 0) {
                    // Needs to redeem the code!
                    let requireRedeemCode = (number != `5493516873147`);
                    // let requireRedeemCode = true;
                    if(requireRedeemCode) {
                      // Create the redeem item
                      const redeemCode = nanoId.nanoid(8);
                      Redeem.create({
                        code: redeemCode,
                        was_redeemed: false,
                        results: JSON.stringify({
                          to: number,
                          type: 'sticker',
                          url: response[0]
                        })
                      });

                      let redeemCodeURL = `https://vbotcito.com/?redeem=${redeemCode}`;
                      let link = await axios.post(`https://shorti.io/api/v1/links/generate`, {
                          "long_link": redeemCodeURL,
                          "require_ads": true
                      });
                      if(link && link.data) {
                        redeemCodeURL = link.data.short_link;
                      }

                      Whappme.sendMessage(number, `👋 Ingresa al siguiente enlace y toca donde dice *Enviar a mi WhatsApp*. Una vez hecho, recibirás el sticker automáticamente: ${redeemCodeURL}`, 1);
                    } else {
                      await Whappme.sendSticker(number, response[0]);
                    }

                    // Notify new features
                    Whappme.notifyNewFeatures(number);
                  } else {
                    Logger.log(`There is no accepted file for GIF`);
                  }

                  return null;
                }));
            });
          });
      } else {
        // Whappme.sendMessage(number, `❗ Si quieres un sticker animado, envíame un GIF en vez de un video`, 1);
      }
    } else if(messageType == Message.TYPES.IMAGE) {
      const artisticEffects = ['al_dente', 'athena', 'eucalyptus', 'hokusai', 'primavera', 'red_rock', 'refresh', 'zorro'];
      const sampleEffect = _.sample(artisticEffects);

      const makeURL = (width, height, imageURL, options = {}) => {
        let baseURL = `https://res.cloudinary.com/demo/image/fetch/w_${width},h_${height},f_auto,f_png`;
        if(options.makeCircular) baseURL += `,r_max,c_fill`
        else baseURL += `,c_pad`;

        if(options.addEffect)
          baseURL += `,e_art:${sampleEffect}`

        const randomColors = ['fff', '222'];
        if(options.includeWatermark){
          if(options.makeCircular)
            baseURL += `/l_text:Roboto_18:@vbotcito,co_rgb:${_.sample(randomColors)},g_south_east,y_4,x_5`;
          else
            baseURL += `/l_text:Roboto_18:@vbotcito,co_rgb:${_.sample(randomColors)},g_south_east,y_4,x_5`;
        }

        /* if(options.includeWatermark){
          // Add icon for vbotcito
          baseURL += `/l_fetch:aHR0cHM6Ly92Ym90Y2l0by5jb20vYXNzZXRzL2ltZy9sb2dvLnBuZw==,w_30,g_south_east,y_35,x_5`;
        } */

        // Add gradient fade
        /* if(options.makeCircular)
          baseURL += `/e_gradient_fade:symmetric_pad,x_0.1`; */


        baseURL += `/${encodeURIComponent(imageURL)}`;

        console.log(`URL ${baseURL}`);

        return baseURL;
      }

      // Properties for request
      let makeTransparent = false;
      let makeCircular = false;
      let addEffect = false;
      if(caption) {
        makeTransparent = caption.toLowerCase().indexOf('trans') > -1;
        makeCircular = caption.toLowerCase().indexOf('circ') > -1;
        addEffect = caption.toLowerCase().indexOf('efec') > -1;
      }

      let transformImageURL = null;
      let endpointURL = null;

      if(!makeTransparent && !makeCircular && !addEffect) {
        // endpointURL = imageURL
        transformImageURL = imageURL;
      } else {
        if(makeTransparent) {
          transformImageURL = `http://165.227.29.132:5001/?url=${encodeURIComponent(imageURL)}&convert=1`
        } else {
          transformImageURL = imageURL;
        }
      }

      endpointURL = makeURL(400, 400, transformImageURL, {
        makeCircular,
        makeTransparent,
        addEffect,
        includeWatermark: !caption || caption.toLowerCase().indexOf('wwm') == -1
      });

      if(endpointURL) {

        let requireRedeemCode = (number != `5493516873147`);
        // let requireRedeemCode = true;

        if(requireRedeemCode) {
          // Create the redeem item
          const redeemCode = nanoId.nanoid(8);
          Redeem.create({
            code: redeemCode,
            was_redeemed: false,
            results: JSON.stringify({
              to: number,
              type: 'sticker',
              url: endpointURL
            })
          });

          let redeemCodeURL = `https://vbotcito.com/?redeem=${redeemCode}`;
          let link = await axios.post(`https://shorti.io/api/v1/links/generate`, {
              "long_link": redeemCodeURL,
              "require_ads": true
          });
          if(link && link.data) {
            redeemCodeURL = link.data.short_link;
          }

          Whappme.sendMessage(number, `👋 Ingresa al siguiente enlace y toca donde dice *Enviar a mi WhatsApp*. Una vez hecho, recibirás el sticker automáticamente: ${redeemCodeURL}`, 1);

          // Notify new features
          Whappme.notifyNewFeatures(number);
        } else {
          console.log(`Request to ${endpointURL}`);
          let stickerSent = await Whappme.sendSticker(number, endpointURL); 
        }
      }

      return null;
    }

    // Get best accurated handler for this kind of request
    let handler;
    let promises = [];
    if(responseDialogFlow && responseDialogFlow.intent && responseDialogFlow.query && responseDialogFlow.query.length > 0) {
      // First, reply what dialog flow replies us
      promises.push(Whappme.sendMessage(number, responseDialogFlow.response));

      // Then look for any response on the handler and then reply it.
      handler = BaseHandler.getHandler(number, responseDialogFlow.query, responseDialogFlow);
      if(handler && handler.isValid()) {
        const results = await handler.getResults();

        if(results && results.length > 0) {
          for(var idx in results) {
            const result = results[idx];
            if(result && result.to && result.text) {
              if(result.type == 'text') {
                promises.push(Whappme.sendMessage(result.to, result.text, _.defaultTo(result.delaySeconds, 0)));
              } else if(result.type == 'video') {
                if(['YoutubeVideoHandler', 'TwitterVideoHandler', 'InstagramVideoHandler'].indexOf(handler.constructor.name) > -1) {
                  // Needs to redeem the content
                  const redeemCode = nanoId.nanoid(8);
                  Redeem.create({
                    code: redeemCode,
                    was_redeemed: false,
                    results: JSON.stringify({
                      to: number,
                      type: 'video',
                      url: result.text
                    })
                  });

                  if(handler.constructor.name == 'TwitterVideoHandler') {
                    Whappme.sendMessage(number, `🤖 Recordá que también podes etiquetarme en twitter como @vbotcito y te respondo por allí!`, 1);
                  }

                  let redeemCodeURL = `https://vbotcito.com/?redeem=${redeemCode}`;
                  let link = await axios.post(`https://shorti.io/api/v1/links/generate`, {
                      "long_link": redeemCodeURL,
                      "require_ads": true
                  });
                  if(link && link.data) {
                    redeemCodeURL = link.data.short_link;
                  }

                  Whappme.sendMessage(number, `👋 Ingresa al siguiente enlace y toca donde dice *Enviar a mi WhatsApp*. Una vez hecho, recibirás el sticker automáticamente: ${redeemCodeURL}`, 1);
                } else {
                  promises.push(Whappme.sendVideo(result.to, result.text, result.caption));
                }
              } else if(result.type == 'audio') {
                promises.push(Whappme.sendAudio(result.to, result.text, _.defaultTo(result.delaySeconds, 0)));
              }
            }
          }
        }
      }
    }

    Promise.all(promises).then(async values => {
      Logger.log(`Sent results to ${number}. Number of messages sent: ${values.length}`);
      
      if(handler && handler.results) {
        /* const jsonText = JSON.stringify(handler.results).replace(/[\\]/g, '\\\\')
          .replace(/[\"]/g, '\\\"')
          .replace(/[\/]/g, '\\/')
          .replace(/[\b]/g, '\\b')
          .replace(/[\f]/g, '\\f')
          .replace(/[\n]/g, '\\n')
          .replace(/[\r]/g, '\\r')
          .replace(/[\t]/g, '\\t'); */

        const jsonText = JSON.stringify(handler.results);

        Conversion.create({
          number: number,
          handler: handler.constructor.name,
          request: query,
          results: jsonText,
          was_success: handler.wasSuccess
        });

        // Notify new features
        if(handler.results.length > 0) {
          Whappme.notifyNewFeatures(number);
        }

        Logger.log(`[Conversions] Saved conversions`);
      }
    });

    return response.json({
      success: true
    });
  }

  getMessageType(messageJSON) {
    if(messageJSON && messageJSON.content) {
      if(messageJSON.content.text != null) {
        return Message.TYPES.TEXT;
      } else if(messageJSON.content.audio_url) {
        return Message.TYPES.AUDIO;
      } else if(messageJSON.content.image_url) {
        return Message.TYPES.IMAGE;
      } else if(messageJSON.content.video_url) {
        return Message.TYPES.VIDEO;
      }
    }

    return Message.TYPES.UNKNOWN;
  }

  async getIntentDialogFlow(from, pattern, type = 'text') {
    // let hash = crypto.createHash('md5').update(from).digest("hex")
    let hash = uuid.v4();
    const sessionId = hash;
    const sessionClient = new dialogflow.SessionsClient({
      keyFilename: './private/pkhere.json'
    });
    const sessionPath = sessionClient.projectAgentSessionPath(`phraseame-vebs`, sessionId);

    let requestBody;
    if(type == 'audio') {
      let promises = [];

      promises.push(new Promise((resolve, reject) => {
        request({ method: 'GET', encoding: null, uri: pattern }, (err, body, buffer) => {
          const buffer64 = buffer.toString('base64')
          resolve(buffer64);
        });
      }));

      let results = await Promise.all(promises);
      if(results && results.length > 0) {
        requestBody = {
          session: sessionPath,
          queryInput: {
            audioConfig: {
              audioEncoding: 'AUDIO_ENCODING_OGG_OPUS',
              sampleRateHertz: 16000,
              languageCode: 'es-ES',
            },
          },
          inputAudio: results[0]
        };
      }
    } else {
      requestBody = {
        session: sessionPath,
        queryInput: {
          text: {
            text: pattern,
            languageCode: 'es-ES',
          },
        },
      };
    }
  
    if(requestBody) {
      // @ts-ignore
      const responses = await sessionClient.detectIntent(requestBody);
      const result = responses[0].queryResult;

      // Logger.log(`Results for intent detection DialogFlow: ${JSON.stringify(responses)}`);

      // Logger.log(`Response from DialogFlow: ${JSON.stringify(result)}`);
      const retVal = {
        query: result.queryText,
        language: result.languageCode,
        response: result.fulfillmentText,
        intent: result.intent != null ? result.intent.displayName : null,
        parameters: result.parameters,
        outputContexts: result.outputContexts
      };
    
      return retVal;
    }

    return null;
  }
}

module.exports = WebhookController
