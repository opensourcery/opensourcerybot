exports.name = 'groups';

var groupsfile = './lib/bin/groups.json';

exports.requires = [
  {
    name: 'groupsfile',
    file: groupsfile,
    type: 'object'
  }
];

exports.help = [
  {
    usage: '@[group] [message]',
    description: 'Says something to a group over PM.'
  },
  {
    usage: '!groupadd [username] (to) [group]',
    description: 'Adds a username to a group.'
  },
  {
    usage: '!groupremove [username] (from) [group]',
    description: 'Removes a username from a group.'
  },
  {
    usage: '!grouplist',
    description: 'Lists all groups.'
  },
  {
    usage: '!grouplist [group]',
    description: 'Lists all members in a group. Please PM this list unless you want to ping everyone.'
  },
  {
    usage: '@all [message]',
    description: 'Sends a message to all users'
  }
];

exports.run = {
  onmessage: function (client, message, requires) {
    var groups = requires.groups.groupsfile;
    var statement,
        group,
        user;

    // If @all doesn't exist, create it
    if (!groups.hasOwnProperty('all')) {
      groups.all = [];
      for (group in groups) {
        if (groups[group].length > 0) {
          groups[group].forEach(function (user) {
            if (groups.all.indexOf(user) < 0) {
              groups.all.push(user);
            }
          });
        }
      }
    }

    var result = /^\@(\S+)\s+(.*)$/.exec(message.content);
    if (result && result[1] && result[2]) {
      group = result[1];
      statement = result[2];
      exports.functions.groupMessage(client, requires, message, group, statement);
      return {status:"success"};
    }

    var result = /^!groupadd\s+(\S+)\s+(?:to\s+)?(\S+)$/.exec(message.content);
    if (result) {
      if (result[1] && result[2]) {
        user = result[1];
        group = result[2];

        // First add to @all, for the record.
        if (groups.all.indexOf(user) < 0) {
          groups.all.push(user);
        }

        if (groups.hasOwnProperty(group)) {
          if (groups[group].indexOf(user) > -1) {
            client.speak(message, '@' + group + ' already has user ' + user + '!');
          }
          else {
            groups[group].push(user);
            client.speak(message, 'User ' + user + ' added to @' + group);
            return {status:"update",file:groupsfile,data:groups};
          }
        }
        else {
          groups[group] = [];
          groups[group].push(user);
          client.speak(message, '@' + group + ' created, and user ' + user + ' added to it');
          return {status:"update",file:groupsfile,data:groups};
        }
      }
      else {
        client.speak(message, 'I couldn\'t recognize that group or user, ' + message.from + '.');
      }
      return {status:"success"};
    }

    var result = /^!groupremove\s+(\S+)\s+(?:from\s+)?(\S+)$/.exec(message.content);
    if (result) {
      if (result[1] && result[2]) {
        user = result[1];
        group = result[2];

        if (groups.hasOwnProperty(group)) {
          if (groups[group].indexOf(user) > -1) {
            groups[group].splice(groups[group].indexOf(user), 1);
            client.speak(message, 'User ' + user + ' removed from @' + group);
            if (groups[group].length < 1) {
              delete groups[group];
              client.speak(message, '@' + group + ' now empty, so removing.');
            }
            return {status:"update",file:groupsfile,data:groups};
          }
          else {
            client.speak(message, 'User ' + user + ' not found in @' + group + ', ' + message.from);
          }
        }
        else {
          client.speak(message, 'I couldn\'t recognize that group, ' + message.from + '.');
        }
      }
      else {
        client.speak(message, 'I couldn\'t recognize that group or user, ' + message.from + '.');
      }
      return {status:"success"};
    }

    var result = /^!grouplist$/.exec(message.content);
    if (result) {
      var return_message = 'Groups are: ';
      var grouplist = [];
      for (group in groups) {
        if (group !== 'all') {
          grouplist.push(group);
        }
      }
      return_message += grouplist.join(', ');
      client.speak(message, return_message);
      return {status:"success"};
    }

    var result = /^!grouplist\s+(\S+)$/.exec(message.content);
    if (result) {
      group = result[1];
      var return_message = 'Members of ' + group + ': ';
      if (groups.hasOwnProperty(group)) {
        return_message += groups[group].join(', ');
        client.speak(message, return_message);
      } else {
        client.speak(message, 'I couldn\'t find that group, ' + message.from);
      }
      return {status:"success"};
    }

    return {status:"fail"};
  }
};

exports.functions = {
  groupMessage: function(client, requires, message, group, statement) {
    var groups = requires.groups.groupsfile;

    if (groups.hasOwnProperty(group)) {
      // PM out '[user] (@[group]): [message]
      statement = message.from + ' (@' + group + '): ' + statement;
      groups[group].forEach(function (member) {
        if (member !== message.from) {
          client.say(member, statement);
        }
      });
    }
    else {
      client.speak(message, 'I couldn\'t recognize that group, ' + message.from + '.');
    }
  },
  groupGet: function(client, requires, message, group) {
    var groups = requires.groups.groupsfile;

    if (groups.hasOwnProperty(group)) {
      return groups[group];
    }
    else {
      client.speak(message, 'I couldn\'t recognize that group, ' + message.from + '.');
      return [];
    }
  }
};