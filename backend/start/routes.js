'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post('webhooks/new_message', 'WebhookController.onReceivedMessage');

// Test mar merchan
/* Route.post('webhooks/mar_merchan', 'WebhookController.onReceivedMessageMarMerchan');
Route.get('mar_merchan/send_messages', 'WebhookController.sendMessages'); */

Route.get('download/audio/:id', 'DownloadController.downloadAudio');

// API
Route.group('api', () => {
    Route.get('reminders/:private_code', 'WebsiteController.getRemindersByPrivateCode');

    Route.get('redeems/code/:code', 'RedeemController.redeemCode');
    Route.post('redeems/code/:code/flag', 'RedeemController.postFlagRedeem');
    Route.get('redeems/code/:code/exists', 'RedeemController.getRedeemByCode');
    
    Route.get('redeems/last_content', 'WebsiteController.getLastContentRedeemed');
    // Route.get('twitter_content/:username', 'WebsiteController.getByTwitterUsername');
}).prefix('api/v1');

Route.on('/').render('welcome')
