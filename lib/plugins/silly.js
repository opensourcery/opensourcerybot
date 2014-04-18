exports.name = 'silly'

exports.weight = 10000

// A general container for miscellaneous, minor things the bot may do

exports.run = function (client, message) {

  var randInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1))
  }

  if (message.from === 'ckwright' && message.to === client.config.handle) {
    client.say(message.to, 'ckwright is trying to manipulate meeeeeeeeee!')
    return {status:"success"}
  }

  // Shout at Chris
  if (message.from === 'ckwright') {
    if (randInt(0, 4) === 1) {
      client.say(message.to, 'Corgis! http://emacs.tips/chase.gif')
      return {status:"success"}
    }
  }

  // Shout at Ryan
  if (message.from === 'thrn') {
    if (randInt(0, 42) === 1) {
      client.say(message.to, 'Did you try turning it off and on again')
      return {status:"success"}
    }
  }

  // Shout at Anne
  if (message.from === 'anniegreens') {
    if (randInt(0, 42) === 1) {
      client.say(message.to, 'No, I\'m totally not biased against you! ಠ_ಠ')
      return {status:"success"}
    }
  }

  result = /snow/i.exec(message.content)
  if (result && message.to !== client.config.name) {
    client.say(message.to, 'Snow? Did someone say snow?')
    return {status:"success"}
  }

  return {status:"fail"}
}
