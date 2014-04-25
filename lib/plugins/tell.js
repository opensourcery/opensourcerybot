exports.name = 'tell'

var tellsfile = './lib/bin/tell.json'

exports.requires = [
  {
    name: 'storedtells',
    file: tellsfile
  }
]

exports.help = [
  {
    usage: '!tell [user] [message]',
    description: 'Tells an online user a message the next time they take an action, or an offline user a message next time they log in.'
  },
  {
    usage: '!telllist [user]',
    description: 'Lists all tells stored for a user and their indices.'
  },
  {
    usage: '!telldrop [user] [index]',
    description: 'Removes a stored tell to a user by its index'
  }
]
/*
exports.run = {
  onmessage: function (client, message, requires) {
    var newwisdom

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
}
*/