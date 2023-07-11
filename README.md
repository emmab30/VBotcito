# VBotcito: Your Personal WhatsApp Bot

VBotcito is a bot developed for WhatsApp, possessing the capability to interpret both text and audio files. When a new WhatsApp message arrives, VBotcito leverages Google's DialogFlow to comprehend the user's intent.

If the sentence predicate contains a date, VBotcito interprets it, converts it, and generates a "Reminder" event. This reminder notifies you about the task you've mentioned at the specified time. 

For example:

1. "Remind me tomorrow at 5 that I need to go to the dentist"

The next day, VBotcito sends you a message to remind you about the dentist appointment.

Beyond reminders, VBotcito's "handlers" (event managers) also allow for downloading videos from platforms like YouTube, Facebook, Twitter, Reddit, etc. It converts these videos and sends them via WhatsApp to the recipient. It can also generate stickers from GIFs, create transparent stickers from photos, and more.

## Technology Stack

VBotcito is built using:

- **Backend**: Node.js 
- **Natural Language Understanding**: Google's DialogFlow
- **WhatsApp Messaging**: A forked external library that allows reading and sending messages through WhatsApp Web. This library is not publicly available.

## References

You can find more about VBotcito on its [Twitter page](https://twitter.com/VBotcito).

