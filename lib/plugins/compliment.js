exports.name = 'compliment'

exports.help = [
  {
    usage: '!m [message]',
    description: 'Prints "You\'re doing great work, " followed by [message].'
  }
]

exports.run = function (client, message) {
  var result = /^!m (.*)$/.exec(message.content)
  if (result) {
    client.say(message.to, "You're doing great work, " + result[1])
    return {status:'success'}
  }
  return {status:"fail"}
}
