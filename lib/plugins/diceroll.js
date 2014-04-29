exports.name = 'diceroll';

exports.help = [
  {
    usage: '!diceroll [d4, d6, d8, d10, d12, d20]',
    description: 'Rolls a n-sided die and returns the result.'
  }
];

exports.run = {
  onmessage: function (client, message) {
    // Add a new diceroll to store for a user
    var result = /^!diceroll\s+d([0-9]+)$/.exec(message.content);
    if (result) {
      if (result[1]) {
        dicesize = result[1];
        var sides = 0;

        // Get the roll from the randRoll function.
        var roll = exports.functions.randRoll(dicesize);

        // If crit fail or win.
        if (roll === 1) {
          client.speak(message,  'Crit fail.');
        }
        else if (roll == dicesize) {
          client.speak(message,  'Crit hit!1! Pass the Cheetos.');
        }

        // Output message.
        client.speak(message,  message.from + ' rolls a '+ roll  + '!');
        return {status:"success"};
      }
      else {
        client.speak(message, '!diceroll doesn\'t work like that, ' + message.from + '!');
        return {status:"fail"};
      }
    } //end result
    return {status:"fail"};
  } //end onmessage
};

/**
 * Random dice roll function.
 *
 * @params
 *  int max The highest number output.
 *
 * @return an integer between 1 and @max
 */
exports.functions = {
  randRoll: function(max) {
    var min = 1;
    var max = typeof max !== 'undefined' ? max : 6;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};
