'use strict'

const Logger = use('App/Helpers/Logger');
const Whappme = use('App/Helpers/Whappme');
const Message = use('App/Models/Message');
const Redeem = use('App/Models/Redeem');
const Feedback = use('App/Models/Feedback');
const BaseHandler = use('App/Handlers/BaseHandler');

// Dependencies
const fs = require('fs');
const _ = require('lodash');
const request = require('request');
const uuid = require('uuid');
const dialogflow = require('@google-cloud/dialogflow');

class RedeemController {

    async getRedeemByCode({ request, response }) {
        const code = request.params.code;

        let redeem = await Redeem
            .query()
            .where('code', code)
            .where('was_redeemed', false)
            .first();
        
        if(redeem) {
            return response.json({
                success: true,
                exists: true
            })
        }

        return response.json({
            success: true,
            exists: false
        })
    }
  
    async redeemCode({ request, response }) {
        const code = request.params.code;

        let redeem = await Redeem
            .query()
            .where('code', code)
            .first();

        if(redeem) {
            /* let stickerSent = await Whappme.sendSticker(number, endpointURL); */

            const payload = JSON.parse(redeem.results);

            if(payload.type == 'sticker') {
                await Whappme.sendSticker(payload.to, payload.url);
            } else if(payload.type == 'video') {
                await Whappme.sendVideo(payload.to, payload.url);
            }

            redeem.was_redeemed = true;
            await redeem.save();

            return response.json({
                success: true,
                redeemed: true
            });
        }

        return response.json({
            success: true,
            redeemed: false
        });
    }

    async postFlagRedeem({ request, response }) {
        const code = request.params.code;

        let redeem = await Redeem
            .query()
            .where('code', code)
            .first();

        if(redeem) {
            const body = request.all();
            if(body && body.times > 0) {
                redeem.flags += body.times;
            } else {
                redeem.flags += 1;
            }
            await redeem.save();
        }

        return response.json({
            success: true
        });
    }

}

module.exports = RedeemController
