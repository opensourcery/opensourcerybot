exports.name = 'eval';

exports.requires = [
  {
    name: 'esprima',
    file: './node_modules/esprima/esprima.js'
  },
  {
    name: 'evaluate',
    file: './node_modules/static-eval/index.js'
  }
];

exports.help = [
  {
    usage: '!eval [expression]',
    description: 'Evaluates a mathematical expression.'
  }
];

exports.run = {
  eval: function (client, message, args, requires) {
    var parse = requires.eval.esprima.parse,
        evaluate = requires.eval.evaluate;

    if (args.length > 0) {
      try {
        var ast = parse(args[0]).body[0].expression;
        client.speak(message, 'Evaluated function: '+ evaluate(ast));
      }
      catch (e) {
        client.speak(message, 'Sigh... Exception: ' + e.toString());
      }
      return {status:'success'};
    }
    return {status:"fail"};
  }
};
