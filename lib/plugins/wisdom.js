exports.name = 'wisdom'

exports.weight = 10

var nuggetsfile = './lib/bin/wisdom.json'
var nextNugget = 0
var nuggets = []

exports.requires = [
  {
    name: 'storednuggets',
    file: nuggetsfile
  }
]

exports.help = [
  {
    usage: '!wisdom',
    description: 'Says a random stored wisdom saying'
  },
  {
    usage: '!wisdom [message]',
    description: 'Adds a saying to the wisdom bank, which may be randomly said.'
  }
]

exports.run = function (client, message, requires) {
  var newwisdom

  var getNugget = function() {
    var nugget = nuggets[nextNugget]
    nextNugget = (nextNugget + 1) % nuggets.length
    return nugget
  }

  var shuffle = function(array) {
    var currentIndex = array.length
      , temporaryValue
      , randomIndex
      ;

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

  if (nuggets.length < 1) {
    // We need to get the stored nuggets and shuffle them
    nuggets = requires.storednuggets
    nuggets = shuffle(nuggets)
  }

  var result = /^!wisdom$/.exec(message.content)
  if (result) {
    client.speak(message, getNugget())
    return {status:'success'}
  }

  var result = /^!wisdom (.*)$/.exec(message.content)
  if (result && result[1]) {
    newwisdom = result[1]

    nuggets.push(newwisdom)
    client.speak(message, 'Got it, ' + message.from + '. Thanks for the nugget!')
    return {status:"update",file:nuggetsfile,data:nuggets}
  }

  // If all is weighted correctly, this should be one of the last things to be
  // processed
  if (requires.functions.randInt(0, 40) === 7) {
    client.speak(message, getNugget())
    return {status:'success'}
  }

  return {status:"fail"}
}
