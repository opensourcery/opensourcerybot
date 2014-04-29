exports.name = 'karma';

exports.weight = 0;

var karmafile = './lib/bin/karma.json';
var lastaward;

exports.requires = [
  {
    name: 'storedkarma',
    file: karmafile
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
    var storedkarma = requires.storedkarma,
        functions = requires.functions;
    var user,
        axis,
        judge = message.from,
        handle = client.config.handle,
        totalkarma,
        amount = 1,
        dice;

    // Someone has affected the karmic sphere!
    var result = /^(\S+?)\s*(\+\+|--)\s+d?([0-9]+)?/.exec(message.content);
    if (result) {
      user = result[1];
      axis = result[2];
      if (result[3]) {
        dice = result[3];
        if (functions.randRoll) {
          amount = functions.randRoll(dice);
        }
        else {
          client.speak(message, 'Sorry, ' + judge + ', I don\'t have diceroll functionality.');
        }
      }
      if (!storedkarma.hasOwnProperty(user)) {
        storedkarma[user] = {
          up: 0,
          down: 0,
          given: 0,
          taken: 0
        };
      }
      if (!storedkarma.hasOwnProperty(judge)) {
        storedkarma[judge] = {
          up: 0,
          down: 0,
          given: 0,
          taken: 0
        };
      }
      if (!storedkarma.hasOwnProperty(handle)) {
        storedkarma[handle] = {
          up: 0,
          down: 0,
          given: 0,
          taken: 0
        };
      }
      if (axis === '++' && user !== message.from) {
        storedkarma[user].up += amount;
        storedkarma[judge].given += amount;
        if (amount > 1) { // They used diceroll to give karma
          client.speak(message, amount + ' karma randomly given to ' + user);
        }
        console.log(message.from + ' awarded ' + amount + ' karma to ' + user);
        if (requires.functions.randInt(0,12) === 5 && lastaward !== judge) {
          // Randomly award karma to those who give karma, as long as they weren't
          // the last recipients of the random karma
          client.speak(message, judge + '++ for keeping the karma rolling.');
          storedkarma[judge].up += 1;
          storedkarma[handle].given += 1;
          lastaward = judge;
        }
        return {status:'update', file:karmafile, data:storedkarma};
      }
      else if (axis === '++') {
        client.speak(message, 'Hey, ' + message.from + '! You can\'t give karma to yourself!');
        return {status:'success'};
      }
      else if (axis === '--') {
        if (user === message.from) {
          client.speak(message, 'If you say so, ' + message.from + '...');
        }
        else {
          storedkarma[judge].taken += amount;
        }
        storedkarma[user].down += amount;
        if (amount > 1) {// They used diceroll to give karma
          client.speak(message, amount + ' karma randomly taken from ' + user);
        }
        console.log(message.from + ' took ' + amount + ' karma from ' + user);
        return {status:'update', file:karmafile, data:storedkarma};
      }
    }

    // What is a user's karma? A miserable little pile of secrets.
    var result = /^!karma\s+(\S+)\s*$/.exec(message.content);
    if (result) {
      user = result[1];
      if (storedkarma.hasOwnProperty(user)) {
        totalkarma = storedkarma[user].up - storedkarma[user].down;
        client.speak(message, 'User ' + user + ' has cumulative karma of ' + totalkarma + ' (+' + storedkarma[user].up + '|-' + storedkarma[user].down + ')');
      }
      else {
        client.speak(message, 'I couldn\'t find karma for that user, ' + message.from + '!');
      }
      return {status:'success'};
    }

    return {status:"fail"};
  }
};
