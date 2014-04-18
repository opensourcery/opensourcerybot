exports.name = 'groups'

exports.requires = [
  {
    name: 'groups',
    file: './lib/bin/groups.json'
  }
]

exports.help = function () {
  return {
    usage: '@[group] [message], !add [username] [group], @all [message]',
    description: 'Sends messages to a group, adds a username to a group, or sends a message to all users, respectively.'
  }
}

exports.run = function (args) {
  var result = /^\@(\S+) (.*)$/.exec(args.message)
  var groups = args.requires.groups
  var message

  if (result) {
    if (result[1] && groups.hasOwnProperty(result[1]) && result[2]) {
      message = groups[result[1]].join(', ')
      message += ': result[2]'
      args.client.say(args.to, message)
      return true
    }
    else {
      args.client.say(args.to, 'I couldn\'t recognize that group, ' + args.from)
    }
  }
  return false
}
