exports.name = 'groups'

exports.requires = [
  {
    name: 'groups',
    file: './lib/bin/groups.json'
  }
]

exports.help = function () {
  return {
    usage: '@[group] [message], !groupadd [username] [group], @all [message]',
    description: 'Sends messages to a group, adds a username to a group, or sends a message to all users, respectively.'
  }
}

exports.run = function (args) {
  var groups = args.requires.groups
  
  var result = /^\@group\s+(\S+)\s+(.*)$/.exec(args.message)
  if (result) {
    if (result[1] && groups.hasOwnProperty(result[1]) && result[2]) {
      var message = groups[result[1]].join(', ')
      message += ': ' + result[2]
      args.client.say(args.to, message)
      return {status:"success"}
    }
    else {
      args.client.say(args.to, 'I couldn\'t recognize that group, ' + args.from + '.')
      return {status:"success"}
    }
  }
  
  var result = /^!groupadd\s+(\S+)\s+(.*)$/.exec(args.message)
  if (result) {
    if (result[1] && result[2] && groups.hasOwnProperty(result[2])) {
      return {status:"success"}
    }
    else {
      args.client.say(args.to, 'I couldn\'t recognize that group, ' + args.from + '.')
      return {status:"success"}
    }
  }
  return {status:"fail"}
}
