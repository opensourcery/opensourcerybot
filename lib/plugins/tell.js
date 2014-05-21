exports.name = 'tell';

var tellsfile = './lib/bin/tells.json';

exports.requires = [
  {
    name: 'storedtells',
    file: tellsfile,
    type: 'object'
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
    var storedtells = requires.tell.storedtells;

    // Add a new tell to store for a user
    var result = /^!tell\s+(\S+)\s+(.*)$/.exec(message.content);
    if (result) {
      if (result[1] && result[2]) {
        user = result[1];
        tell_content = result[2];

        if (!storedtells.hasOwnProperty(user)) {
          storedtells[user] = [];
        }

        newtell = {
          from: message.from,
          message: tell_content,
          timestamp: Date.now()
        };

        storedtells[user].push(newtell);
        client.speak(message, user + ' will be notified when they next log in or speak, ' + message.from + '.');
        return {status:'update',file:tellsfile,data:storedtells};
      }
      else {
        client.speak(message, '!tell doesn\'t work like that, ' + message.from + '!');
      }
    }

    // List how many tells for a user (otherwise privacy is in question)
    // @TODO make this list all tells FROM the asker.
    var result = /^!telllist\s+(\S+)$/.exec(message.content);
    if (result && result[1]) {
      user = result[1];
      if (storedtells.hasOwnProperty(user)) {
        client.speak(message, 'User ' + user + ' has ' + storedtells[user].length + ' tells stored.');
      }
      else {
        client.speak(message, 'I have no tells stored for user ' + user + '.');
      }
      return {status:'success'};
    }

    var result = /^!telldrop\s+(\S+)\s+(\d+)$/.exec(message.content);
    if (result && result[1]) {
      user = result[1];

      return {status:'success'};
    }

    if (storedtells.hasOwnProperty(message.from) && storedtells[message.from].length > 0) {
      console.log('Sending stored tells to ' + message.to);
      client.speak(message, 'Hold on, I have stored messages for you, ' + message.from + '!');
      for (var i = 0;i < storedtells[message.from].length;i++) {
        tell = storedtells[message.from][i];
        timestamp = new Date(tell.timestamp);

        client.say(message.from, 'From ' + tell.from + ' on ' + timestamp.toString() + ':' );
        client.say(message.from, tell.message);
      };
      storedtells[message.from] = [];

      return {status:'update',file:tellsfile,data:storedtells};
    }

    return {status:"fail"};
  },
  onjoin: function(client, message, requires) {
    var storedtells = requires.tell.storedtells;
    var tell,
        timestamp;

    if (storedtells.hasOwnProperty(message.from) && storedtells[message.from].length > 0) {
      console.log('Sending stored tells to ' + message.to);
      client.say(message.from, 'I have stored messages for you, ' + message.from + '!');
      for (var i = 0;i < storedtells[message.from].length;i++) {
        tell = storedtells[message.from][i];
        timestamp = new Date(tell.timestamp);

        client.say(message.from, 'From ' + tell.from + ' on ' + timestamp.toString() + ':' );
        client.say(message.from, tell.message);
      };
      storedtells[message.from] = [];

      return {status:'update',file:tellsfile,data:storedtells};
    }

    return {status:"fail"};
  }
};