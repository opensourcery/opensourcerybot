exports.name = 'groups'

var groupsfile = './lib/bin/groups.json'

exports.requires = [
  {
    name: 'groups',
    file: groupsfile
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
    }
    else {
      args.client.say(args.to, 'I couldn\'t recognize that group, ' + args.from + '.')
    }
    return {status:"success"}
  }
  
  var result = /^!groupadd\s+(\S+)\s+(.*)$/.exec(args.message)
  if (result) {
    if (result[1] && result[2] && groups.hasOwnProperty(result[2])) {
      if (groups[result[2]][result[1]]) {
        args.client.say(args.to, result[2] + ' already has user ' + result[1] + '!')
      }
      else {
        groups[result[2]].push(result[1])
        return {status:"update",file:'./lib/bin/groups.json',data:groups}
      }
    }
    else {
      args.client.say(args.to, 'I couldn\'t recognize that group or user, ' + args.from + '.')
    }
    return {status:"success"}
  }
  
  return {status:"fail"}
}
