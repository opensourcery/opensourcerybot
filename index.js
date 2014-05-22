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
    fs.readdirSync('./lib/plugins').forEach(function (name) {
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
              else {
                // It's probably a node-module then.
                requires[plugin.name][required.name] = require(required.file);
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
        onmessage: function (client, message) {
        var result = /^!reload$/.exec(message.content);
        if (result) {
          functions.loadPlugins();
          client.speak(message, 'Reloaded definition files.');
          return {status:"success"};
        }
        return {status:"fail"};
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
      onmessage: function (client, message) {
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
        var command;
        var result = /^!help\s?(\S*)?$/.exec(message.content);

        if (result) {
          if (result[1]) {
            command = result[1];
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
        return {status:"fail"};
      }
    }
  }
];

var checkCommand = function (command, event, from, to, content) {
  var message = {
    to: to,
    from: from,
    content: content
  };
  var result = {
    status: 'fail'
  };
  if (command.run.hasOwnProperty(event)) {
    result = command.run[event](client, message, requires);
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
      plugin_found = false;
  console.log(from + ' said ' + content + ' to ' + to);

  builtin_found = builtins.some(function (command) {
    if (checkCommand(command, 'onmessage', from, to, content).status === 'success') {
      return true;
    }
    return false;
  });

  if (!builtin_found) {
    plugin_found = plugins.some(function (command) {
      var result = checkCommand(command, 'onmessage', from, to, content);

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
  console.log(user + ' joined ' + channel);

  builtin_found = builtins.some(function (command) {
    if (checkCommand(command, 'onjoin', user, channel, content).status === 'success') {
      return true;
    }
    return false;
  });

  if (!builtin_found) {
    plugin_found = plugins.some(function (command) {
      var result = checkCommand(command, 'onjoin', user, channel, content);

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
