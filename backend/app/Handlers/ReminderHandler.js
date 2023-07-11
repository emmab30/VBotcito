// Models
const Reminder = use('App/Models/Reminder');
const Conversion = use('App/Models/Conversion');
const Number = use('App/Models/Number');
const Feedback = use('App/Models/Feedback');

const BaseHandler = require('./BaseHandler');
const request = require('request');
const _ = require('lodash');
const fs = require('fs');
const youtubedl = require('youtube-dl')
const moment = require('moment');
moment.locale('es');

// Available commands
const LIST_COMMANDS = ['rm list', '!rm list', 'rmlist', '!rmlist', 'recordatorios', 'lista'];
const DELETE_COMMANDS = ['rm del', '!rm del', 'rmdel', '!rmdel', 'borrar', 'del', 'borrar recordatorio'];

class ReminderHandler extends BaseHandler {
  constructor(to, text, parameters) {
    super(to, text, parameters)
  }

  // To be implemented for each function
  async getResults() {
    const { text, parameters } = this;

    if(LIST_COMMANDS.indexOf(text) > -1) { // Reminder listing
      let reminders = await Reminder
        .query()
        .where('number', this.to)
        .where('was_reminded', 0)
        .where('is_deleted', 0)
        .orderBy('reminder_at', 'ASC')
        .fetch();

      if(reminders) {
        reminders = reminders.toJSON();

        if(reminders && reminders.length > 0) {
          let formatted = `⏰Lista de tus próximos recordatorios:`;
          for(var idx in reminders) {
            const result = reminders[idx];
            formatted += `\n\n» ${moment(result.reminder_at).format('dddd DD [de] MMM [a las] HH:mm')}`;
            formatted += `\n${result.text}`
            formatted += `\nID: ${result.id}`
          }

          this.addResult(this.to, formatted);
        } else {
          this.addResult(this.to, '⏰ Todavía no tenés recordatorios. Escribe *!rm help* para saber como crear uno');
        }
      } else {
        this.addResult(this.to, '⭕ Algo pasó, no pude completar esta acción. ¡Déjame pensar y lo solucionaré!');
      }
    } else if(_.some(DELETE_COMMANDS, (i) => text.includes(i))) { // Reminder deletion
      let ids = (text.match(/\d+/g) || []).map(n => parseInt(n));

      if(ids && ids.length > 0) {
        let results = 0;
        let isAdmin = false;

        if(this.to == '5493516873147') {
          let reminder = await Reminder.query().where('id', ids[0]).first();
          results = await Reminder
            .query()
            .where('is_deleted', 0)
            .whereIn('id', ids)
            .update({
              is_deleted: 1
            });

          if(reminder != null) {
            this.to = reminder.number;
            isAdmin = true;
          }
        } else {
          results = await Reminder
            .query()
            .where('is_deleted', 0)
            .whereIn('id', ids)
            .where('number', this.to)
            .update({
              is_deleted: 1
            });
        }

        console.log(`Removed`, results);

        if(results > 0) {
          if(isAdmin) {
            this.addResult(this.to, `✅ Se eliminaron algunos recordatorios de tu lista por el administrador. Posiblemente podés estar infringiendo algunas normas.`);
          } else {
            if(results == 1) {
              this.addResult(this.to, `✅ Se eliminó 1 recordatorio de tu lista`);
            } else {
              this.addResult(this.to, `✅ Se eliminaron ${results} recordatorios de tu lista`);
            }
          }
        } else {
          this.addResult(this.to, '⭕ Parece que ese recordatorio no existe o no es tuyo.');  
        }
      } else {
        this.addResult(this.to, '⭕ Parece que ese recordatorio no existe');
      }
    } else { // Reminder creation
      if(parameters && parameters.fields && parameters.fields['date-time']) {
        const dateTime = parameters.fields['date-time'];
        let date = null;
        if(dateTime.stringValue)
          date = moment(dateTime.stringValue);
        if(dateTime.listValue)
          date = moment(parameters.fields['date-time'].listValue.values[0].structValue.fields.date_time.stringValue);
        else if(dateTime.structValue) {
          if(parameters.fields['date-time'].structValue.fields.date_time) {
            date = moment(parameters.fields['date-time'].structValue.fields.date_time.stringValue);
          } else if(parameters.fields['date-time'].structValue.fields.endDateTime) {
            date = moment(parameters.fields['date-time'].structValue.fields.endDateTime.stringValue);
          } else if(
            parameters.fields['date-time'].structValue.fields.startDate &&
            parameters.fields['date-time'].structValue.fields.endDate) { // We don't have certain date / time
            this.addResult(this.to, '⭕ No me queda claro cuando necesitas que te recuerde esto');
          }
        }

        if(date && date.isValid()) {
          let reminder = await Reminder
            .create({
              text: this.formatReminder(text),
              number: this.to,
              reminder_at: date.format('YYYY-MM-DD HH:mm:ss'),
              was_reminded: 0
            });

          let number = await Number
            .query()
            .where('number', this.to)
            .first();

          if(reminder) {
            const ID = reminder.id;

            let response = `Agendado el *${date.format('dddd DD [de] MMM [a las] HH:mm')}* (≈ ${date.fromNow()}) 😎. Escribe *!rm del ${ID}* si deseas borrarlo ⛔️`;

            // If we got the number, then send the URL
            if(number) {
              number = number.toJSON();
              response += `\n\n 🙀 Mirá tu lista de recordatorios: https://vbotcito.com/reminders/${number.private_code} o escribe *!rm list*`;
            }

            this.addResult(this.to, response, 'text', 0);
          }
        }
      }
    }

    return this.results;
  }

  formatReminder(text) {
    return text.replace('!rm', '').trim();
  }

  isValid() {
    return true;
  }
}

module.exports = ReminderHandler;