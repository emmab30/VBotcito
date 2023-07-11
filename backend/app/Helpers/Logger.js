class Logger {
  static log(text, object = {}) {
    if(Object.keys(object).length > 0) {
      console.info(`[VBotcito][${new Date().toLocaleString()}] ${text}`, object)
    } else {
      console.info(`[VBotcito][${new Date().toLocaleString()}] ${text}`)
    }
  }
}

module.exports = Logger;