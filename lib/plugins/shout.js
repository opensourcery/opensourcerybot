exports.name = 'shout'

exports.help = function () {
  return {
    usage: '!shout [message]',
    description: 'Repeats [message], transliterated to UPPERCASE'
  }
}

exports.run = function (client, data) {
  var result = /^!shout (.*)$/.exec(data.message)
  if (result) {
    client.say(data.to, result[1].toUpperCase())
    return {status:'success'}
  }
  return {status:"fail"}
}
