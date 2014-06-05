exports.name = 'doge';

exports.weight = 0;

var wowfile = './lib/data/doge.json';
var nextwow = 0;
var wows = [];

exports.requires = [
  {
    name: 'storedwows',
    file: wowfile,
    type: 'array'
  }
];

exports.help = [
  {
    usage: '!doge [message]',
    description: 'Adds a saying to the doge bank, which may be randomly said when spoken to.'
  }
];

var getWow = function() {
  var wow = wows[nextwow];
  nextwow = (nextwow + 1) % wows.length;
  while (!wow) {
    wow = wows[nextwow];
    nextwow = (nextwow + 1) % wows.length;
  }
  return wow;
}

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
}

exports.run = {
  doge: function (client, message, args, requires) {
    if (args.length > 0) {
      var newWow = args.join(' ');
      if (wows.length < 1) {
        // We need to get the stored wows and shuffle them
        wows = requires.doge.storedwows;
        wows = shuffle(wows);
      }

      wows.push(newWow);
      client.speak(message, 'Got it. Thanks for the wow, ' + message.from + '.');
      return {status:"update",file:wowfile,data:wows};
    }
    else {
      client.speak(message, 'I need something to be wowed with, ' + message.from + '.');
    }
    return {status:"success"};
  }
};

exports.regex = function (client, message, requires) {
  var result = /wow/i.exec(message.content);

  if (wows.length < 1) {
    // We need to get the stored wows and shuffle them
    wows = requires.doge.storedwows;
    wows = shuffle(wows);
  }

  if (result) {
    client.speak(message, getWow());
    return {status:'success'};
  }
  return {status:"fail"};
}