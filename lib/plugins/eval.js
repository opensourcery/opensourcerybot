exports.name = 'eval'

exports.requires = [
  {
    name: 'esprima',
    file: 'esprima'
  }
]

exports.help = [
  {
    usage: '!eval [expression]',
    description: 'Evaluates a mathematical expression.'
  }
]

exports.run = function (client, message, requires) {
  var result = /^!eval\s+(.+)$/.exec(message.content)
  var parse = requires.esprima

  if (result) {
    try {
      console.log('About to evaluate ' + result[1])
      var ast = parse(result[1]).body[0].expression;
      client.speak(message, evaluate(ast))
    }
    catch (e) {
      client.speak(message, 'Sigh... Exception: ' + e.toString())
    }
    return {status:'success'}
  }
  return {status:"fail"}
}
