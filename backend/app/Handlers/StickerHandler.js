const Logger = use('App/Helpers/Logger');

const BaseHandler = require('./BaseHandler');
const _ = require('lodash');

class StickerHandler extends BaseHandler {
  constructor(to, text, parameters, dialogFlowResponse) {
    super(to, text)

    this.dialogFlowResponse = dialogFlowResponse;
  }

  // To be implemented for each function
  getResults() {
    let text = this.text;
    let dialogFlowResponse = this.dialogFlowResponse;

    if(dialogFlowResponse.outputContexts && dialogFlowResponse.outputContexts.length) {
      const outputContext = dialogFlowResponse.outputContexts[0];
      if(outputContext && outputContext.parameters && outputContext.parameters.fields) {
        const isCircular = outputContext.parameters.fields.shape.stringValue == 'circular';
        const makeTransparent = outputContext.parameters.fields.make_transparent.stringValue == 'si';
        const includeEffect = outputContext.parameters.fields.include_effect.stringValue == 'si';

        Logger.log(`New sticker request. Circular: ${isCircular}, transparent: ${makeTransparent}, effect: ${includeEffect}`);
      
        /* // Make the sticker :-)
        const artisticEffects = ['al_dente', 'athena', 'eucalyptus', 'hokusai', 'primavera', 'red_rock', 'refresh', 'zorro'];
        const makeURL = (width, height, imageURL, options = {}) => {
          let baseURL = `https://res.cloudinary.com/demo/image/fetch/w_${width},h_${height},c_fill,r_max,f_auto,f_png`;
          if(caption && caption.indexOf('efecto') > -1 && options.aEffect)
            baseURL += `,e_art:${options.aEffect}`
          if(options.includeWatermark)
            baseURL += `/l_text:Impact_30:@vbotcito,co_rgb:555,g_south_east,y_8`;

          baseURL += `/${encodeURIComponent(imageURL)}`;

          return baseURL;
        }

        // If not transparent, not effect and rectangular then send it with the original URL.
        let imageStickerURL = ``;
        if(!isCircular && !makeTransparent && !includeEffect) {
          imageStickerURL = `http://165.227.29.132:5001/?url=${encodeURIComponent(imageURL)}&convert=${transparent ? 1 : 0}`;
        }

        let toTransformImageURL = null;
        let transparent = caption && caption.length && caption.indexOf('transparente') > -1;
        if(transparent)
          toTransformImageURL = `http://165.227.29.132:5001/?url=${encodeURIComponent(imageURL)}&convert=${transparent ? 1 : 0}`;
        else
          toTransformImageURL = imageURL;

        let endpointURL = makeURL(400, 400, toTransformImageURL, {
          aEffect: _.sample(artisticEffects),
          includeWatermark: true
        });

        console.log(`Request to ${endpointURL}`);
        let stickerSent = await Whappme.sendSticker(number, endpointURL);
        return null; */
      }
    }

    return this.results;
  }

  isValid() {
    return true;
  }
}

module.exports = StickerHandler;