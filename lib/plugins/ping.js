exports.name = 'ping';

exports.help = [
  {
    usage: 'ping',
    description: 'Tests to make sure I am alive.'
  }
];

exports.run = {
  onmessage: function (client, message) {
    var result = /^ping$/.exec(message.content);
    if (result) {
      client.speak(message, message.from + ', pong');
      return {status:'success'};
    }
    return {status:"fail"};
  }
};
