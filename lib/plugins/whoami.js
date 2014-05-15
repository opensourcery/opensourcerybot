exports.name = 'whoami';

exports.help = [
  {
    usage: 'who are you?',
    description: 'Provides an elevator speech style autobiography.'
  }
];

exports.run = {
  onmessage: function (client, message) {
    var result = /^who are you/i.exec(message.content);
    if (result) {
      client.speak(message, message.from + ', I am an IRC bot. originally envisioned by Adam DiCarlo and maintained by the friendly folks at OpenSourcery');
      return {status:'success'};
    }
    return {status:"fail"};
  }
};
