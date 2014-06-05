exports.name = 'compliment';

exports.help = [
  {
    usage: '!m [message]',
    description: 'Prints "You\'re doing great work, " followed by [message].'
  }
];

exports.run = {
  m: function (client, message, args) {
    var compliment = args.join(' ');
    client.speak(message, "You're doing great work, " + compliment);
    return {status:'success'};
  }
};
