exports.name = 'ping'

exports.help = function () {
  return {
    usage: 'ping',
    description: 'Tests to make sure I am alive.'
  }
}

exports.run = function (client, data) {
  var result = /^ping$/.exec(data.message)
  if (result) {
    client.say(data.to, data.from + ', pong')
    return {status:'success'}
  }
  return {status:"fail"}
}
