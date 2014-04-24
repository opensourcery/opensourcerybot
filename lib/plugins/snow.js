exports.name = 'snow'

exports.run = function (client, message) {
  var result = /snow/i.exec(message.content)
  if (result && message.to !== client.config.name) {
    client.speak(message, 'Snow? Did someone say snow?')
    return {status:"success"}
  }
  return {status:"fail"}
}