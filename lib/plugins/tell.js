exports.name = 'tell';

var tellsfile = './lib/bin/tells.json';

exports.requires = [
  {
    name: 'storedtells',
    file: tellsfile
  }
];

exports.help = [
  {
    usage: '!tell [user] [message]',
    description: 'Tells an online user a message the next time they take an action, or an offline user a message next time they log in.'
  },
  {
    usage: '!telllist [user]',
    description: 'Lists all tells stored for a user and their indices.'
  },
  {
    usage: '!telldrop [user] [index]',
    description: 'Removes a stored tell to a user by its index'
  }
];

exports.run = {
  onmessage: function (client, message, requires) {
    var newtell,
        user,
        message;

    var result = /^!tell\s+(\S+)\s+(.*)$/.exec(message.content);
    if (result) {
      if (result[1] && result[2]) {
        user = result[2];
        message = result[2];
      }
      return {status:'success'};
    }

    var result = /^!telllist\s+(\S+)$/.exec(message.content);
    if (result && result[1]) {
      user = result[1];

      return {status:'success'};
    }

    var result = /^!telldrop\s+(\S+)\s+(\d+)$/.exec(message.content);
    if (result && result[1]) {
      user = result[1];

      return {status:'success'};
    }

    return {status:"fail"};
  }
};
