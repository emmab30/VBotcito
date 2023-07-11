'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Message extends Model {
  
  static TYPES = {
    TEXT: 'text',
    AUDIO: 'audio',
    IMAGE: 'image',
    VIDEO: 'video',
    UNKNOWN: 'unknown'
  };
 
}

module.exports = Message
