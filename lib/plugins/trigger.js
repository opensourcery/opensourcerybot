exports.name = 'trigger';
exports.weight = 1;

var triggersFile = './lib/bin/trigger.json';
var responses = {};

exports.requires = [
  {
    name: 'triggers',
    file: triggersFile
  }
];

exports.help = [
  {
    usage: '!trigger [trigger] [response]',
    description: 'Add a trigger and response when a word is said.'
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
     console.log(trigger);
     console.log(response);
     responses[trigger] = response;
     client.speak(message, 'Got it ' + message.from + ', thanks.');
     return {status: 'update',file:triggersFile,data:responses};
    }

    // Check for triggers.
    for (var trigger in responses) {
      var testMessage =  message.content.toLowerCase();
      if (testMessage.indexOf(trigger) != -1) {
        client.speak(message, responses[trigger]);
        return {status:"success"};
      }
    }

    return {status:'fail'};
  }
};
