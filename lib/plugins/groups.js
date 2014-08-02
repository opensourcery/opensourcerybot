exports.name = 'groups';
exports.aliases = ['group', 'geroup'];
exports.weight = 999999;
// Needs to have maximum weight so that group responses happen last.

var groupsfile = './lib/bin/groups.json';
var lastgroupsfile = './lib/bin/groups_lastgroup.json';

exports.requires = [
  {
    name: 'groupsfile',
    file: groupsfile,
    type: 'object'
  },
  {
    name: 'lastgroups',
    file: lastgroupsfile,
    type: 'object'
  }
];

exports.help = [
  {
    usage: '@[group] [message]',
    description: 'Says something to a group over PM.'
  },
  {
    usage: '[message to OSbot]',
    description: 'Say something to the last group you\'ve spoken or been spoken to.'
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
    var lastgroups = requires.groups.lastgroups;
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
      lastgroups = exports.functions.groupMessage(client, requires, message, group, statement);
      return {status:"update",file:lastgroupsfile,data:groups};
    }

    var result = /^!groupadd\s+((?:\S+,\s+)*\S+)\s+(?:to\s+)?(\S+)$/.exec(message.content);
    if (result) {
      var userlist = result[1];
      group = result[2];
      userlist = userlist.split(',')
      userlist.forEach( function (user) {
        // Trim them to get rid of whitespace.
        user = user.trim();

        // First add to @all, for the record.
        if (groups.all.indexOf(user) < 0) {
          groups.all.push(user);
        }

        if (groups.hasOwnProperty(group)) {
          if (groups[group].indexOf(user) > -1) {
            client.say(message.from, '@' + group + ' already has user ' + user + '!');
          }
          else {
            groups[group].push(user);
            client.say(message.from, 'User ' + user + ' added to @' + group);
            return {status:"update",file:groupsfile,data:groups};
          }
        }
        else {
          groups[group] = [];
          groups[group].push(user);
          client.say(message.from, '@' + group + ' created, and user ' + user + ' added to it');
          return {status:"update",file:groupsfile,data:groups};
        }
      });
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
            client.say(message.from, 'User ' + user + ' removed from @' + group);
            if (groups[group].length < 1) {
              delete groups[group];
              client.say(message.from, '@' + group + ' now empty, so removing.');
            }
            return {status:"update",file:groupsfile,data:groups};
          }
          else {
            client.say(message.from, 'User ' + user + ' not found in @' + group + ', ' + message.from);
          }
        }
        else {
          client.say(message.from, 'I couldn\'t recognize that group, ' + message.from + '.');
        }
      }
      else {
        client.say(message.from, 'I couldn\'t recognize that group or user, ' + message.from + '.');
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
      client.say(message.from, return_message);
      return {status:"success"};
    }

    var result = /^!grouplist\s+(\S+)$/.exec(message.content);
    if (result) {
      group = result[1];
      var return_message = 'Members of ' + group + ': ';
      if (groups.hasOwnProperty(group)) {
        return_message += groups[group].join(', ');
        client.say(message.from, return_message);
      } else {
        client.say(message.from, 'I couldn\'t find that group, ' + message.from);
      }
      return {status:"success"};
    }

    // If a non-command message is PMd to OSbot, assume it is a response to the most-likely relevant group.
    if (message.to === client.config.handle && lastgroups[message.from]) {
      group = lastgroups[message.from];
      lastgroups = exports.functions.groupMessage(client, requires, message, group, message.content);
      return {status:"update",file:lastgroupsfile,data:groups};
    }

    return {status:"fail"};
  }
};

exports.functions = {
  groupMessage: function(client, requires, message, group, statement) {
    var groups = requires.groups.groupsfile;
    var lastgroups = requires.groups.lastgroups;

    if (groups.hasOwnProperty(group)) {
      lastgroups[message.from] = group;
      // PM out '[user] (@[group]): [message]
      statement = message.from + ' (@' + group + '): ' + statement;
      groups[group].forEach(function (member) {
        if (member !== message.from) {
          client.say(member, statement);
          lastgroups[member] = group;
        }
      });
    }
    else {
      client.speak(message, 'I couldn\'t recognize that group, ' + message.from + '.');
    }
    return lastgroups;
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