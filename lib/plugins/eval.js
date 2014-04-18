exports.name = 'eval'

exports.requires = [
  {
    name: 'esprima',
    file: 'esprima'
  }
]

exports.help = function () {
  return {
    usage: '!eval [expression]',
    description: 'Evaluates a mathematical expression.'
  }
}

exports.run = function (args) {
  var result = /^!eval\s+(.+)$/.exec(args.message)
  var parse = args.esprima

  if (result) {
    try {
      console.log('About to evaluate ' + result[1])
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
