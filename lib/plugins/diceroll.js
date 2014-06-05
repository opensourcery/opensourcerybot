exports.name = 'diceroll';

exports.help = [
  {
    usage: '!diceroll [d4, d6, d8, d10, d12, d20]',
    description: 'Rolls a n-sided die and returns the result.'
  }
];

exports.run = {
  // Add a new diceroll to store for a user
  diceroll: function (client, message, args, requires) {
    if (args.length > 0) {
      // Time to roll some dice!
      var dicesize = args[0].split('d');
      var story = args[1];
      console.log(dicesize);

      // Get the roll from the randRoll function.
      var roll = exports.functions.randRoll(dicesize[1]);

      // If crit fail or win.
      if (roll === 1) {
        client.speak(message,  'Crit fail.');
      }
      else if (roll == dicesize) {
        client.speak(message,  'Crit hit!1! Pass the Cheetos.');
      }

      // Output message.
      if (typeof story !== 'undefined') {
        client.speak(message,  message.from + ' rolls a ' + roll + ' ' + story + '!');
      }
      else {
        client.speak(message,  message.from + ' rolls a ' + roll + '!');
      }
      return {status:"success"};
    }
    else {
      client.speak(message, '!diceroll doesn\'t work like that, ' + message.from + '!');
      return {status:"fail"};
    }
  } //end result
};

exports.functions = {
  /**
   * Random dice roll function.
   *
   * @params
   *  int max The highest number output.
   *
   * @return an integer between 1 and @max
   */
  randRoll: function(max) {
    var min = 1;
    max = typeof max !== 'undefined' ? max : 6;
    // Max out max at 20.
    if (max > 20) {
      max = 20;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};
