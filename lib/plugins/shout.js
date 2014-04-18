exports.name = 'shout'

exports.help = function () {
  return {
    usage: '!shout [message]',
    description: 'Repeats [message], transliterated to UPPERCASE'
  }
}

exports.run = function (args) {
  var result = /^!shout (.*)$/.exec(args.message)
  if (result) {
    args.client.say(args.to, result[1].toUpperCase())
    return {status:'success'}
  }
  return {status:"fail"}
}
