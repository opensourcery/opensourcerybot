exports.name = 'compliment'

exports.help = function () {
  return {
    usage: '!m [message]',
    description: 'Prints "You\'re doing great work, " followed by [message].'
  }
}

exports.run = function (args) {
  var result = /^!m (.*)$/.exec(args.message)
  if (result) {
    args.client.say(args.to, "You're doing great work, " + result[1])
    return true
  }
  return false
}
