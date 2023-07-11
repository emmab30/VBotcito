"use strict";

// Models and helpers
const Reminder = use('App/Models/Reminder');
const Logger = use('App/Helpers/Logger');
const Whappme = use('App/Helpers/Whappme');

// Dependencies
const Task = use("Task");
const moment = require('moment');

class ReminderCheckerTask extends Task {
  static get schedule() {
    const interval = "*/1 * * * *"; // Every 1 minute
    return interval;
  }

  async handle() {
    const fromDate = moment().format('YYYY-MM-DD HH:mm:00');
    const toDate = moment().format('YYYY-MM-DD HH:mm:59');

    let reminders = await Reminder
      .query()
      .where('is_deleted', 0)
      .where('reminder_at', '>=', fromDate)
      .where('reminder_at', '<=', toDate)
      .where('was_reminded', 0)
      .fetch();
      
    if(reminders) {
      reminders = reminders.toJSON();
      if(reminders.length > 0) {
        Logger.log(`There are ${reminders.length} reminders to be notified and then deleted.`);

        for(var idx in reminders) {
          const reminder = reminders[idx];
          let text = `🔔 *${reminder.text}*`;

          Whappme.sendMessage(reminder.number, text)

          console.log(`Reminded to ${reminder.number}!`);
          await Reminder
            .query()
            .where('id', reminder.id)
            .update({
              was_reminded: true
            });
        }
      }
    }
  }
}

module.exports = ReminderCheckerTask;
