exports.name = 'compliment'

exports.help = function () {
  return {
    usage: '!m [message]',
    description: 'Prints "You\'re doing great work, " followed by [message].'
  }
}

exports.run = function (client, data) {
  var result = /^!m (.*)$/.exec(data.message)
  if (result) {
    client.say(data.to, "You're doing great work, " + result[1])
    return {status:'success'}
  }
  return {status:"fail"}
}
