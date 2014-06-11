exports.name = 'karma';

exports.weight = 0;

var karmafile = './lib/bin/karma.json';
var tellsfile = './lib/bin/tells.json';
var lastaward;

exports.requires = [
  {
    name: 'storedkarma',
    file: karmafile,
    type: 'object'
  },
  {
    name: 'storedtells',
    file: tellsfile,
    type: 'object'
  }
];

exports.help = [
  {
    usage: '[user]++',
    description: 'Gives a user (not you) karma. It\'s free! Be generous!'
  },
  {
    usage: '[user]--',
    description: 'Removes karma from a user (can be you). Be nice!'
  },
  {
    usage: '!karma [user]',
    description: 'Displays karma of a given user.'
  }
];

exports.run = {
  onmessage: function (client, message, requires) {
    var storedkarma = requires.karma.storedkarma,
        functions = requires.functions;
    var users = [],
        recipient,
        axis,
        judge = message.from,
        totalkarma,
        amount = 1,
        dice;

    // Someone has affected the karmic sphere!
    var result = /^(\S+?)\s*(\+\+|--)(?:\s+)?([0-9]+)?d?([0-9]+)?/.exec(message.content);
    if (result) {
      recipient = result[1];
      axis = result[2];

      // Check for sending to a group if groups are enabled
      if (functions.groupGet && recipient.indexOf('@') === 0) {
        users = functions.groupGet(client, requires, message, recipient.substring(1));
      }
      else {
        users.push(recipient);
      }

      // Check for a diceroll if diceroll is enabled.
      if (result[4]) {
        dice = result[4];
        multiplier = (typeof(result[3]) == 'undefined') ? 1 : result[3];
        if (functions.randRoll) {
          amount = functions.randRoll(dice, multiplier);
          // If the total amount is greater than twenty, set it to twenty.
          if(amount > 20) {
            amount = 20;
          }
          if (axis === '++') {
            client.speak(message, amount + ' karma randomly given to ' + recipient);
          }
          else {
            client.speak(message, amount + ' karma randomly taken from ' + recipient);
          }
        }
        else {
          client.say(message.from, 'Sorry, ' + judge + ', I don\'t have diceroll functionality.');
        }
      }
      if (!storedkarma.hasOwnProperty(judge)) {
        storedkarma[judge] = {
          up: 0,
          down: 0,
          given: 0,
          taken: 0
        };
      }

      users.forEach(function(user) {
        if (!storedkarma.hasOwnProperty(user)) {
          storedkarma[user] = {
            up: 0,
            down: 0,
            given: 0,
            taken: 0
          };
        }
        if (axis === '++' && user !== message.from) {
          storedkarma = exports.functions.karmaAdd(client, requires, message, user, amount);
        }
        else if (axis === '++') {
          client.speak(message, 'Hey, ' + message.from + '! You can\'t give karma to yourself!');
        }
        else if (axis === '--') {
          storedkarma = exports.functions.karmaRemove(client, requires, message, user, amount);
        }
      });

      if (axis === '++') {
        if (requires.functions.randInt(0,12) === 5 && lastaward !== message.from) {
          // Randomly award karma to those who give karma, as long as they weren't
          // the last recipients of the random karma
          client.speak(message, message.from + '++ for keeping the karma rolling.');
          storedkarma[message.from].up += 1;
          storedkarma[client.config.handle].given += 1;
          lastaward = message.from;
        }
      }
      return {status:'update', file:karmafile, data:storedkarma};
    }

    // What is a user's karma? A miserable little pile of secrets.
    var result = /^!karma\s+(\S+)\s*$/.exec(message.content);
    if (result) {
      user = result[1];
      if (storedkarma.hasOwnProperty(user)) {
        totalkarma = storedkarma[user].up - storedkarma[user].down;
        client.say(message.from, 'User ' + user + ' has cumulative karma of ' + totalkarma + ' (+' + storedkarma[user].up + '|-' + storedkarma[user].down + ')');
      }
      else {
        client.say(message.from, 'I couldn\'t find karma for that user, ' + message.from + '!');
      }
      return {status:'success'};
    }
    return {status:"fail"};
  },
  onjoin: function(client, message, requires) {
    var storedkarma = requires.karma.storedkarma;
    var handle = client.config.handle;

    // Set up osbot's base karma score.
    if (!storedkarma.hasOwnProperty(handle)) {
      storedkarma[handle] = {
        up: 0,
        down: 0,
        given: 0,
        taken: 0
      };
    }

    return {status:"fail"};
  }
};

exports.functions = {
  /**
   * Add karma to a user.
   *
   * @params
   *  client (object) The standard osbot client object.
   *  requires (object) The standard osbot requires object.
   *  message (object) The standard osbot message object.
   *  to (string) The user getting the karma, assumed not be "from".
   *  amount (int) The amount of karma to give.
   *
   * @return (object) Adjusted storedkarma object
   */
  karmaAdd: function(client, requires, message, to, amount) {
    var storedkarma = requires.karma.storedkarma;
    var from = message.from;
    functions = requires.functions;

    storedkarma[to].up += amount;
    storedkarma[message.from].given += amount;
    console.log(message.from + ' awarded ' + amount + ' karma to ' + to);
    // Tell the user they got karma.
    if(functions.tell){
      storedTells = requires.karma.storedtells;
      newTell = {
        to: to,
        from: client.config.handle,
        message: 'You received ' + amount  + ' karma from ' + message.from + '.',
        timestamp: Date.now()
      };
      functions.tell(newTell, storedTells);
    }
    return storedkarma;
  },
  /**
   * Remove karma from a user.
   *
   * @params
   *  client (object) The standard osbot client object.
   *  requires (object) The standard osbot requires object.
   *  message (object) The standard osbot message object.
   *  to (string) The user losing the karma, assumed not be "from".
   *  amount (int) The amount of karma to take.
   *
   * @return (object) Adjusted storedkarma object
   */
  karmaRemove: function(client, requires, message, to, amount) {
    var storedkarma = requires.karma.storedkarma;
    var user = message.from;
    functions = requires.functions;

    if (to === user) {
      client.speak(message, 'If you say so, ' + user + '...');
    }
    else {
      storedkarma[user].taken += amount;
    }
    storedkarma[to].down += amount;
    console.log(user + ' took ' + amount + ' karma from ' + to);
    // Tell the user they got karma.
    if(functions.tell){
      storedTells = requires.karma.storedtells;
      newTell = {
        to: to,
        from: client.config.handle,
        message: message.from + ' took ' + amount  + ' karma from you.',
        timestamp: Date.now()
      };
      functions.tell(newTell, storedTells);
    }
    return storedkarma;
  }
};