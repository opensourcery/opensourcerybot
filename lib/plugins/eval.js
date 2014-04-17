exports.name = 'eval'

exports.help = function () {
  return {
    usage: '!eval [expression]',
    description: 'Evaluates a mathematical expression.'
  }
}

exports.run = function (args) {
  var result = /^!eval\s+(.+)$/.exec(args.message)
  if (result) {
    try {
      var ast = parse(result[1]).body[0].expression;
      args.client.say(args.to, evaluate(ast))
    }
    catch (e) {
      args.client.say(args.to, 'Sigh... Exception: ' + e.toString())
    }
    return true
  }
  return false
}
