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
    usage: '!grouplist',
    description: 'Lists all groups.'
  },
  {
    usage: '!grouplist [group]',
    description: 'Lists all members in a group.'
  },
  {
    usage: '@all [message]',
    description: 'Sends a message to all users'
  }
]

exports.run = function (client, message, requires) {
  var groups = requires.groups
  var statement
    , group
    , user

  var result = /^\@(\S+)\s+(.*)$/.exec(message.content)
  if (result) {
    if (result[1] && groups.hasOwnProperty(result[1]) && result[2]) {
      group = result[1]
      statement = result[2]
      var return_message = groups[group].join(', ')
      return_message += ': ' + statement
      client.speak(message, return_message)
    }
    else {
      client.speak(message, 'I couldn\'t recognize that group, ' + message.from + '.')
    }
    return {status:"success"}
  }

  var result = /^!groupadd\s+(\S+)\s+(.*)$/.exec(message.content)
  if (result) {
    if (result[1] && result[2]) {
      user = result[1]
      group = result[2]

      if (groups.hasOwnProperty(group)) {
        if (groups[group].indexOf(user) > -1) {
          client.speak(message, 'Group ' + group + ' already has user ' + user + '!')
        }
        else {
          groups[group].push(user)
          client.speak(message, 'User ' + user + ' added to group ' + group)
          return {status:"update",file:groupsfile,data:groups}
        }
      }
      else {
        groups[group] = []
        groups[group].push(user)
        client.speak(message, 'Group ' + group + ' created, and user ' + user + ' added to it')
        return {status:"update",file:groupsfile,data:groups}
      }
    }
    else {
      client.speak(message, 'I couldn\'t recognize that group or user, ' + message.from + '.')
    }
    return {status:"success"}
  }

  var result = /^!grouplist$/.exec(message.content)
  if (result) {
    var return_message = 'Groups are: '
    var grouplist = []
    for (group in groups) {
      grouplist.push(group)
    }
    return_message += grouplist.join(', ')
    client.speak(message, return_message)
    return {status:"success"}
  }

  var result = /^!grouplist\s+(\S+)$/.exec(message.content)
  if (result) {
    group = result[1]
    var return_message = 'Members of ' + group + ': '
    if (groups.hasOwnProperty(group)) {
      return_message += groups[group].join(', ')
      client.speak(message, return_message)
    } else {
      client.speak(message, 'I couldn\'t find that group, ' + message.from)
    }
    return {status:"success"}
  }

  return {status:"fail"}
}
