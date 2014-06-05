exports.name = 'comeback';

exports.weight = 10;

var comebackfile = './lib/bin/comebacks.json';
var nextcomeback = 0;
var comebacks = [];

exports.requires = [
  {
    name: 'storedcomebacks',
    file: comebackfile,
    type: 'array'
  }
];

exports.help = [
  {
    usage: '!comeback',
    description: 'Says a random stored comeback saying.'
  },
  {
    usage: '!comeback [message]',
    description: 'Adds a saying to the comeback bank, which may be randomly said when spoken to.'
  }
];

var getComeback = function() {
  var comeback = comebacks[nextcomeback];
  nextcomeback = (nextcomeback + 1) % comebacks.length;
  while (!comeback) {
    comeback = comebacks[nextcomeback];
    nextcomeback = (nextcomeback + 1) % comebacks.length;
  }
  return comeback;
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

if (comebacks.length < 1) {
  // We need to get the stored comebacks and shuffle them
  comebacks = requires.comeback.storedcomebacks;
  comebacks = shuffle(comebacks);
}

exports.run = {
  comeback: function (client, message, args, requires) {
    if (args.length > 0) {
      // Someone wants a random comeback.
      client.speak(message, getComeback());
    } else {
      // Someone is adding a new comeback.
      var newcomeback = args.join(' ');

      comebacks.push(newcomeback);
      client.speak(message, 'Got it. Thanks for the comeback, ' + message.from + '.');
      return {status:"update",file:comebackfile,data:comebacks};
    }
    return {status:'success'};
  },
  regex: function (client, message, requires) {

    var result = new RegExp(client.config.handle, ['i']);
    result = result.exec(message.content);
    if (result && message.to !== client.config.handle) {
      client.speak(message, getComeback());
      return {status:"success"};
    }

    return {status:"fail"};
  }
};
