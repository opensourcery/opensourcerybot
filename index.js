var irc = require('irc'),
    fs = require('fs'),
    path = require('path');

var config = require('./config');

var client = new irc.Client(config.network, config.handle, config.params);

// Some client additions
// We put the config inside the client for easy grabbing should it come up in a plugin
client.config = config;
// We add our own speaking function to whisper if the sender is whispering.
client.speak = function (message, content) {
  if (message.to === config.handle) {
    client.say(message.from, content);
  }
  else {
    client.say(message.to, content);
  }
};

var requires = {};

var functions = {
  loadPlugins: function () {
    plugins = [];
    var startups = [];
    var workingplugins = ['alarm.js', 'alias.js', 'comeback.js']; // Add plugin filenames here as they are fixed.
    fs.readdirSync('./lib/plugins').forEach(function (name) {
      if (workingplugins.indexOf(name) < 0) {
        return true;
      }
      var filename = path.resolve('./lib/plugins/' + name);
      delete require.cache[filename];
      var plugin = require('./lib/plugins/' + name);
      if (!plugin.weight) {
        plugin.weight = 0;
      }
      plugins.push(plugin);
      if (plugin.functions) {
        for (var func in plugin.functions) {
          functions[func] = plugin.functions[func];
        }
      }
      if (plugin.startup) {
        plugin.startup.forEach(function(startfunc) {
          startups.push(startfunc);
        });
      }
      if (plugin.requires) {
        requires[plugin.name] = {};
        plugin.requires.forEach(function (required) {
          if (required.name && required.file) {
            fs.exists(required.file, function(exists) {
              if (exists) {
                requires[plugin.name][required.name] = require(required.file);
              }
              else if (required.type) {
                var newfilecontent;
                switch (required.type) {
                  case 'object':
                    newfilecontent = "{}";
                    break;
                  case 'array':
                    newfilecontent = "[]";
                    break;
                }
                fs.writeFile(required.file, newfilecontent, function (e) {
                  if (e) {
                    console.log(e);
                  }
                });
                requires[plugin.name][required.name] = JSON.parse(newfilecontent);
              }
            });
          }
        });
      }
    });
    plugins.sort(function (a, b) {
      return a.weight - b.weight;
    });
    // We wait until now to run the startups, so that they go in order.
    startups.sort(function (a, b) {
      return a.weight - b.weight;
    });
    if (startups.length > 0) {
      startups.forEach(function(startfunc) {
        if (startfunc.function) {
          startfunc.function(client);
        }
      });
    }
  },
  updateFile: function (file, data) {
    var string = JSON.stringify(data);
    fs.writeFile(file, string, function (e) {
      if (e) {
        console.log(e);
      }
    });
  },
  randInt: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1));
  }
};

requires.functions = functions;

var builtins = [
  {
    name: 'reload',
    help: [
      {
        usage: '!reload',
        description: 'Reloads all definition files'
      }
    ],
    run: {
      reload: function (client, message) {
        functions.loadPlugins();
        client.speak(message, 'Reloaded definition files.');
        return {status:"success"};
      }
    }
  },
  {
    name: 'help',
    help: [
      {
        usage: '!help',
        description: 'Lists all possible help topics.'
      },
      {
        usage: '!help [command]',
        description: 'Gives more information about a specific help topic.'
      }
    ],
    run: {
      help: function (client, message, args) {
        var command;
        var allbuiltinnames = builtins.map(function (elem) {
          if (elem.hasOwnProperty('help')) {
            return elem.name;
          }
        }).filter(function(value) {
          return value !== false;
        }).join(", ")
          , allpluginnames = plugins.map(function (elem) {
          if (elem.hasOwnProperty('help')) {
            return elem.name;
          }
          else {
            return false;
          }
        }).filter(function (value) {
          return value !== false;
        }).join(", ");
        var helpfunctions;

        if (args[0]) {
          command = args[0];
        }

        if (command) {
          builtins.forEach(function (builtin) {
            if (builtin.name === command && builtin.hasOwnProperty('help')) {
              helpfunctions = builtin.help;
            }
          });
          if (!helpfunctions) {
            plugins.forEach(function (plugin) {
              if (plugin.name === command && plugin.hasOwnProperty('help')) {
                helpfunctions = plugin.help;
              }
            });
          }
          if (helpfunctions) {
            helpfunctions.forEach(function (helpfunction) {
              client.speak(message, 'Usage: ' + helpfunction.usage + ', ' + helpfunction.description);
            });
          }
          else {
            client.speak(message, 'Sorry, function not found or has no help info.');
          }
        }
        else {
          client.speak(message, 'Possible help topics: ' + allbuiltinnames + ', ' + allpluginnames);
        }
        return {status:"success"};
      }
    }
  }
];

var checkCommand = function (plugin, event, message) {
  var args = [];
  var command;
  var result = {
    status: 'fail'
  };
  var message_groups = {
    run: /^!(\S+)(.*)$/,
    group: /^@(\S+)(.*)$/ // Ideally this could be set up by the group plugin,
    // but there is no infrastructure for it at the moment, thus it is hard-defined
  };
  if (event === 'onmessage') {
    for (var command_type in message_groups) {
      var input = message_groups[command_type].exec(message.content);
      if (input) {

        if (input[2]) {
          args = input[2].trim().split([' ']);
        }
        if (input[1]) {
          command = input[1];
          if (plugin.hasOwnProperty(command_type) && plugin[command_type].hasOwnProperty(command)) {
            result = plugin[command_type][command](client, message, args, requires);
          }
        }
      }
    }
    if (result.status === 'fail') {
      // We didn't find a named function, so do other more anonymous ones, like
      // regex.
      if (plugin.hasOwnProperty('regex')) {
        result = plugin.regex(client, message, requires);
      }
    }
  }
  // We aren't checking for onmessage commands, but some other function, so look for that
  else {
    if (plugin.hasOwnProperty(event) && plugin[command_type].hasOwnProperty(command)) {
      result = plugin[command_type][command](client, message, command);
    }
  }
  return result;
};

var plugins = [];
functions.loadPlugins();

client.addListener('error', function (content) {
  console.log('error: ', content);
});

// When a message is received, look through our functions for 'message' function
// and run it. Stops looking for for functions when one returns 'success'.
client.addListener('message', function (from, to, content) {
  var builtin_found = false,
      plugin_found = false,
      args = [],
      command;
  var message = {
    to: to,
    from: from,
    content: content
  };
  console.log(from + ' said ' + content + ' to ' + to);

  builtin_found = builtins.some(function (builtin) {

    if (checkCommand(builtin, 'onmessage', message).status === 'success') {
      return true;
    }
  });

  if (!builtin_found) {
    plugin_found = plugins.some(function (plugin) {
      var result = checkCommand(plugin, 'onmessage', message);

      switch (result.status) {
        case 'fail':
          break
        case 'update':
          if (result.hasOwnProperty('file') && result.hasOwnProperty('data')) {
            functions.updateFile(result.file, result.data);
            console.log(result.file + ' updated.');
          } else {
            console.log('Missing update file or data.');
          }
        case 'success':
          return true;
      }
      return false;
    });
  }
});

// When a user joins the channel, look through all plugins and builtins for an
// onjoin function, and run any of them that exist. Note that all onjoin functions
// get run, unlike with onmessage, which stops at the first success.
client.addListener('join', function (channel, user, content) {
  var builtin_found = false,
      plugin_found = false;
  var message = {
    from: user,
    to: false,
    content: content
  }
  console.log(user + ' joined ' + channel);

  builtin_found = builtins.some(function (builtin) {
    if (checkCommand(builtin, 'onjoin', message).status === 'success') {
      return true;
    }
    return false;
  });

  if (!builtin_found) {
    plugin_found = plugins.some(function (plugin) {
      var result = checkCommand(plugin, 'onjoin', message);

      switch (result.status) {
        case 'fail':
          break
        case 'update':
          if (result.hasOwnProperty('file') && result.hasOwnProperty('data')) {
            functions.updateFile(result.file, result.data);
            console.log(result.file + ' updated.');
          }
        case 'success':
          return true;
      }
      return false;
    });
  }

});
