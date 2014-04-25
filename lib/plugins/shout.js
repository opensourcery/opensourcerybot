exports.name = 'shout';

exports.help = [
  {
    usage: '!shout [message]',
    description: 'Repeats [message], transliterated to UPPERCASE'
  }
];

exports.run = {
  onmessage: function (client, message) {
    var result = /^!shout (.*)$/.exec(message.content);
    if (result) {
      client.say(message.to, result[1].toUpperCase());
      return {status:'success'};
    }
    return {status:"fail"};
  }
};