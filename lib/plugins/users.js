exports.name = 'silly'

exports.weight = 10000

// A general container for miscellaneous, minor things the bot may do

exports.run = {
    onmessage: function (client, message, requires) {

    if (message.from === 'ckwright' && message.to === client.config.handle) {
      client.speak(message, 'ckwright is trying to manipulate meeeeeeeeee!')
      return {status:"success"}
    }

    // Shout at Chris
    if (message.from === 'ckwright') {
      if (requires.functions.randInt(0, 4) === 1) {
        client.speak(message, 'Corgis! http://emacs.tips/chase.gif')
        return {status:"success"}
      }
    }

    // Shout at Ryan
    if (message.from === 'thrn') {
      if (requires.functions.randInt(0, 42) === 1) {
        client.speak(message, 'Did you try turning it off and on again')
        return {status:"success"}
      }
    }

    return {status:"fail"}
  }
}
