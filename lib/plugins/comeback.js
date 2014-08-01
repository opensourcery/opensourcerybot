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

exports.run = {
  onmessage: function (client, message, requires) {
    var newcomeback;

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

    var result = /^!comeback$/.exec(message.content);
    if (result) {
      client.respond(message, getComeback());
      return {status:'success'};
    }

    var result = /^!comeback (.*)$/.exec(message.content);
    if (result && result[1]) {
      newcomeback = result[1];

      comebacks.push(newcomeback);
      client.respond(message, 'Got it. Thanks for the comeback, ' + message.from + '.');
      return {status:"update",file:comebackfile,data:comebacks};
    }

    var result = new RegExp(client.config.handle, ['i']);
    result = result.exec(message.content);
    if (result && message.to !== client.config.handle) {
      client.respond(message, getComeback());
      return {status:"success"};
    }

    return {status:"fail"};
  }
};
