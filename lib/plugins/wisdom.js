exports.name = 'wisdom';
exports.aliases = ['nuggets', 'nugget'];

exports.weight = 20;

var nuggetsfile = './lib/bin/wisdom.json';
var nextNugget = 0;
var nuggets = [];

exports.requires = [
  {
    name: 'storednuggets',
    file: nuggetsfile,
    type: 'array'
  }
];

exports.help = [
  {
    usage: '!wisdom',
    description: 'Says a random stored wisdom saying'
  },
  {
    usage: '!wisdom [message]',
    description: 'Adds a saying to the wisdom bank, which may be randomly said.'
  }
];

exports.run = {
  onmessage: function (client, message, requires) {
    var newwisdom;
    var functions = requires.functions;

    var getNugget = function() {
      var nugget = nuggets[nextNugget];
      nextNugget = (nextNugget + 1) % nuggets.length;
      return nugget;
    };

    var shuffle = function(array) {
      var currentIndex = array.length,
          temporaryValue,
          randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    };

    if (nuggets.length < 1) {
      // We need to get the stored nuggets and shuffle them
      nuggets = requires.wisdom.storednuggets;
      nuggets = shuffle(nuggets);
    }

    var result = /^!wisdom$/.exec(message.content);
    if (result) {
      client.respond(message, getNugget());
      return {status:'success'};
    }

    // If the groups plugin is enabled, allow sending wisdom to groups.
    if (requires.functions.groupMessage) {
      var result = /^!wisdom \@(\S+)$/.exec(message.content);
      if (result && result[1]) {
        var group = result[1];
        requires.functions.groupMessage(client, requires, message, group, getNugget());
        return {status:'success'};
      }
    }

    var result = /^!wisdom (.*)$/.exec(message.content);
    if (result && result[1]) {
      var maxCharLength = 140;
      newwisdom = result[1];
      if (newwisdom.length > maxCharLength){
        console.log('wisdom is too long');
        client.speak(message, 'Whoa there turbo, no more than ' + maxCharLength + ' characters.');
        return {status:"fail"};
      }
      nuggets.push(newwisdom);
      client.respond(message, 'Got it, ' + message.from + '. Thanks for the nugget!');
      return {status:"update",file:nuggetsfile,data:nuggets};
    }

    // If all is weighted correctly, this should be one of the last things to be
    // processed
    if (requires.functions.randInt(0, 40) === 7) {
      client.respond(message, getNugget());
      return {status:'success'};
    }

    return {status:"fail"};
  }
};