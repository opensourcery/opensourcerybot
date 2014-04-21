exports.name = 'ping'

exports.help = [
  {
    usage: 'ping',
    description: 'Tests to make sure I am alive.'
  }
]

exports.run = function (client, message) {
  var result = /^ping$/.exec(message.content)
  if (result) {
    client.say(message.to, message.from + ', pong')
    return {status:'success'}
  }
  return {status:"fail"}
}
