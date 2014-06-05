exports.name = 'kudos';

var tellsfile = './lib/bin/tells.json';

exports.requires = [
  {
    name: 'nodemailer',
    file: './node_modules/nodemailer/lib/nodemailer.js'
  }
];

exports.help = [
  {
    usage: '!kudos [user] [message]',
    description: 'Sends an email with the message "[message]" to the configurable kudos email specifying it was "from [yourname] to [user]".'
  },
];

exports.run = {
  onmessage: function (client, message, requires) {
    var result = /^!kudos\s+(\S+)\s+(.+)$/.exec(message.content);
    if (result) {
      var transport = requires.kudos.nodemailer.createTransport('Direct', {debug: true});

      var emailmessage = {
        from: 'OpenSourcery Bot <' + client.config.kudos + '>',
        to: 'Kudos <' + client.config.kudos + '>',
        subject: 'Kudos from ' + message.from + ' to ' + result[1],
        text: result[2]
      }

      transport.sendMail(emailmessage, function (error, response) {
        if (error) {
          client.say(message.from, 'Failed to send message to '
                     + client.config.kudos
                     + ' failed: '
                     + error);
        }
        else {
          client.say(message.from, 'Sent message to ' + client.config.kudos);
        }
      });
      return {status:"success"};
    }
    return {status:"fail"};
  }
};
