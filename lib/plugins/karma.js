exports.name = 'karma'

exports.weight = 0

var karmafile = './lib/bin/karma.json'

exports.requires = [
  {
    name: 'storedkarma',
    file: karmafile
  }
]

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
]

exports.run = function (client, message, requires) {
var storedkarma = requires.storedkarma
var user
  , axis
  , totalkarma

  // Someone has affected the karmic sphere!
  var result = /^(\S+?)(\+\+|--)/.exec(message.content)
  if (result) {
    user = result[1]
    axis = result[2]
    if (!storedkarma.hasOwnProperty(user)) {
      storedkarma[user] = {}
      storedkarma[user].up = 0
      storedkarma[user].down = 0
    }
    if (axis == '++' && user != message.from) {
      storedkarma[user].up += 1
      console.log(message.from + ' awarded karma to ' + user)
      return {status:'update', file:karmafile, data:storedkarma}
    }
    else if (axis == '++') {
      client.say(message.to, 'Hey, ' + message.from + '! You can\'t give karma to yourself!')
      return {status:'success'}
    }
    else if (axis == '--') {
      if (user == message.from) {
        client.say(message.to, 'If you say so, ' + message.from + '...')
      }
      storedkarma[user].down += 1
      console.log(message.from + ' took karma from ' + user)
      return {status:'update', file:karmafile, data:storedkarma}
    }
  }
  
  // What is a user's karma? A miserable little pile of secrets.
  var result = /^!karma\s+(\S+)$/.exec(message.content)
  if (result) {
    user = result[1]
    if (storedkarma.hasOwnProperty(user)) {
      totalkarma = storedkarma[user].up - storedkarma[user].down
      client.say(message.to, 'User ' + user + ' has cumulative karma of ' + totalkarma + ' (+' + storedkarma[user].up + '|-' + storedkarma[user].down + ')')
    }
    else {
      client.say(message.to, 'I couldn\'t find karma for that user, ' + message.from + '!')
    }
    return {status:'success'}
  }

  return {status:"fail"}
}
