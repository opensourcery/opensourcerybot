exports.name = 'trigger';
exports.weight = 500;

var triggersFile = './lib/bin/trigger.json';
var responses = {};

exports.requires = [
  {
    name: 'triggers',
    file: triggersFile,
    type: 'object'
  }
];

exports.help = [
  {
    usage: '!trigger [trigger] [response]',
    description: 'Add a trigger and response when a word is said.'
  },
  {
    usage: '!triggerlist',
    description: 'List all the triggers in a PM.'
  },
  {
    usage: '!triggerdelete [trigger]',
    description: 'Delete a given trigger.'
  }
];

exports.run = {
  onmessage: function (client, message, requires) {
    // Load the triggers.
    if (Object.getOwnPropertyNames(responses).length === 0) {
      responses = requires.trigger.triggers;
    }

    // Add new triggers.
    result = /^!trigger (\S+) (.*)$/.exec(message.content);
    if (result && result[1] && result[2]) {
     trigger = result[1];
     var response = result[2];
     trigger.toLowerCase();
     responses[trigger] = response;
     client.respond(message, 'Got it ' + message.from + ', thanks.');
     return {status: 'update',file:triggersFile,data:responses};
    }

    // List the triggers and responses.
    result = /^!triggerlist$/.exec(message.content);
    if (result) {
     console.log(result);
     for (var trigger in responses){
      client.say(message.from, 'Trigger: "' + trigger + '" Response: "' + responses[trigger] + '"');
     }
     return {status: "success"};
    }

    // Delete a trigger.
    result = /^!triggerdelete (\S+)$/.exec(message.content);
    if (result && result[1] ) {
     trigger = result[1];
     trigger.toLowerCase();
     // Delete trigger.
     delete responses[trigger];
     client.respond(message, 'Got it ' + message.from + ', ' + trigger + ' deleted, thanks.');
     return {status: 'update', file:triggersFile, data:responses};
    }

    // Check for triggers.
    for (var trigger in responses) {
      var testMessage =  message.content.toLowerCase();
      if (testMessage.indexOf(trigger) != -1) {
        client.respond(message, responses[trigger]);
        return {status:"success"};
      }
    }

    return {status:'fail'};
  }
};
