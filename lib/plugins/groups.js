exports.name = 'groups'

var groupsfile = './lib/bin/groups.json'

exports.requires = [
  {
    name: 'groups',
    file: groupsfile
  }
]

exports.help = [
  {
    usage: '@[group] [message]',
    description: 'Says something to a group.'
  },
  {
    usage: '!groupadd [username] [group]',
    description: 'Adds a username to a group.'
  },
  {
    usage: '@all [message]',
    description: 'Sends a message to all users'
  }
]

exports.run = function (client, message, requires) {
  var groups = requires.groups

  var result = /^\@group\s+(\S+)\s+(.*)$/.exec(message.content)
  if (result) {
    if (result[1] && groups.hasOwnProperty(result[1]) && result[2]) {
      var return_message = groups[result[1]].join(', ')
      return_message += ': ' + result[2]
      client.say(message.to, return_message)
    }
    else {
      client.say(message.to, 'I couldn\'t recognize that group, ' + message.from + '.')
    }
    return {status:"success"}
  }

  var result = /^!groupadd\s+(\S+)\s+(.*)$/.exec(message.content)
  if (result) {
    if (result[1] && result[2] && groups.hasOwnProperty(result[2])) {
      if (groups[result[2]][result[1]]) {
        client.say(message.to, result[2] + ' already has user ' + result[1] + '!')
      }
      else {
        groups[result[2]].push(result[1])
        return {status:"update",file:'./lib/bin/groups.json',message:groups}
      }
    }
    else {
      client.say(message.to, 'I couldn\'t recognize that group or user, ' + message.from + '.')
    }
    return {status:"success"}
  }

  return {status:"fail"}
}
