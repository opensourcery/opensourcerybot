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
  var statement
    , group
    , user

  var result = /^\@group\s+(\S+)\s+(.*)$/.exec(message.content)
  if (result) {
    if (result[1] && groups.hasOwnProperty(result[1]) && result[2]) {
      group = result[1]
      statement = result[2]
      var return_message = groups[group].join(', ')
      return_message += ': ' + statement
      client.say(message.to, return_message)
    }
    else {
      client.say(message.to, 'I couldn\'t recognize that group, ' + message.from + '.')
    }
    return {status:"success"}
  }

  var result = /^!groupadd\s+(\S+)\s+(.*)$/.exec(message.content)
  if (result) {
    if (result[1] && result[2]) {
      user = result[1]
      group = result[2]

      if (groups.hasOwnProperty(group)) {
        if (groups[group][user]) {
          client.say(message.to, group + ' already has user ' + user + '!')
        }
        else {
          groups[group].push(user)
          client.say(message.to, user + ' added to group ' + group)
          return {status:"update",file:groupsfile,message:groups}
        }
      }
      else {
        groups[group] = []
        groups[group].push(user)
        client.say(message.to, group + ' created, and user ' + user + ' added to it')
        return {status:"update",file:groupsfile,message:groups}
      }
    }
    else {
      client.say(message.to, 'I couldn\'t recognize that group or user, ' + message.from + '.')
    }
    return {status:"success"}
  }

  return {status:"fail"}
}
