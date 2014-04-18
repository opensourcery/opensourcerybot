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

exports.run = function (client, data, config, requires) {
  var result = /^!eval\s+(.+)$/.exec(data.message)
  var parse = requires.esprima

  if (result) {
    try {
      console.log('About to evaluate ' + result[1])
      var ast = parse(result[1]).body[0].expression;
      client.say(data.to, evaluate(ast))
    }
    catch (e) {
      client.say(data.to, 'Sigh... Exception: ' + e.toString())
    }
    return {status:'success'}
  }
  return {status:"fail"}
}
