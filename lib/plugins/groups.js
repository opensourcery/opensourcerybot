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

exports.run = function (client, data, config, requires) {
  var groups = requires.groups

  var result = /^\@group\s+(\S+)\s+(.*)$/.exec(data.message)
  if (result) {
    if (result[1] && groups.hasOwnProperty(result[1]) && result[2]) {
      var message = groups[result[1]].join(', ')
      message += ': ' + result[2]
      client.say(data.to, message)
    }
    else {
      client.say(data.to, 'I couldn\'t recognize that group, ' + data.from + '.')
    }
    return {status:"success"}
  }

  var result = /^!groupadd\s+(\S+)\s+(.*)$/.exec(data.message)
  if (result) {
    if (result[1] && result[2] && groups.hasOwnProperty(result[2])) {
      if (groups[result[2]][result[1]]) {
        client.say(data.to, result[2] + ' already has user ' + result[1] + '!')
      }
      else {
        groups[result[2]].push(result[1])
        return {status:"update",file:'./lib/bin/groups.json',data:groups}
      }
    }
    else {
      client.say(data.to, 'I couldn\'t recognize that group or user, ' + data.from + '.')
    }
    return {status:"success"}
  }

  return {status:"fail"}
}
