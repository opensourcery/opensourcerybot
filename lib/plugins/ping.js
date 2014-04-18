exports.name = 'ping'

exports.help = function () {
  return {
    usage: 'ping',
    description: 'Tests to make sure I am alive.'
  }
}

exports.run = function (args) {
  var result = /^ping$/.exec(args.message)
  if (result) {
    args.client.say(args.to, args.from + ', pong')
    return {status:'success'}
  }
  return {status:"fail"}
}
