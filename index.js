var irc = require('irc')
  , fs = require('fs')
  , path = require('path')

var config = require('./config')

var client = new irc.Client(config.network, config.handle, config.params)
// Some client additions
client.config = config // We put the config inside the client for easy grabbing should it come up in a plugin
client.speak = function (message, content) {
  if (message.to === config.handle) {
    client.say(message.from, content)
  }
  else {
    client.say(message.to, content)
  }
}

var functions = {
  loadPlugins: function () {
    plugins = []
    fs.readdirSync('./lib/plugins').forEach(function (name) {
      var filename = path.resolve('./lib/plugins/' + name)
      delete require.cache[filename]
      var plugin = require('./lib/plugins/' + name)
      if (!plugin.weight) {
        plugin.weight = 0
      }
      plugins.push(plugin)
      if (plugin.functions) {
        for (func in plugin.functions) {
          if (functions[func]) {
            console.log("Duplicate function " + func + " from " + name + ".")
          }
          else {
            functions[func] = plugin.functions[func]
          }
        }
      }
    })
    plugins.sort(function (a, b) {
      return a.weight - b.weight
    })
  },
  updateFile: function (file, data) {
    var string = JSON.stringify(data)
    fs.writeFile(file, string, function (e) {
      if (e) {
        console.log(e)
      }
    })
  },
  randInt: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1))
  }
}

var builtins = [
  {
    name: 'reload',
    help: [
      {
        usage: '!reload',
        description: 'Reloads all definition files'
      }
    ],
    run: function (client, message) {
      var result = /^!reload$/.exec(message.content)
      if (result) {
        functions.loadPlugins()
        client.speak(message, 'Reloaded definition files.')
        return {status:"success"}
      }
      return {status:"fail"}
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
    run: function (client, message) {
      var allbuiltinnames = builtins.map(function (elem) {
        if (elem.hasOwnProperty('help')) {
          return elem.name
        }
      }).filter(function(value) {
        return value !== false
      }).join(", ")
        , allpluginnames = plugins.map(function (elem) {
        if (elem.hasOwnProperty('help')) {
          return elem.name
        }
        else {
          return false
        }
      }).filter(function (value) {
        return value !== false
      }).join(", ")

      var helpfunctions
      var command
      var result = /^!help\s?(\S*)?$/.exec(message.content)

      if (result) {
        if (result[1]) {
          command = result[1]
          builtins.forEach(function (builtin) {
            if (builtin.name === command && builtin.hasOwnProperty('help')) {
              helpfunctions = builtin.help
            }
          })
          if (!helpfunctions) {
            plugins.forEach(function (plugin) {
              if (plugin.name === command && plugin.hasOwnProperty('help')) {
                helpfunctions = plugin.help
              }
            })
          }
          if (helpfunctions) {
            helpfunctions.forEach(function (helpfunction) {
              client.speak(message, 'Usage: ' + helpfunction.usage + ', ' + helpfunction.description)
            })
          }
          else {
            client.speak(message, 'Sorry, function not found or has no help info.')
          }
        }
        else {
          client.speak(message, 'Possible help topics: ' + allbuiltinnames + ', ' + allpluginnames)
        }
        return {status:"success"}
      }
      return {status:"fail"}
    }
  }
]

var checkCommand = function (command, from, to, content) {
  var requires = {functions:functions}
  var message = {
    to: to,
    from: from,
    content: content
  }
  if (command.requires) {
    command.requires.forEach(function (required) {
      if (required.name && required.file) {
        requires[required.name] = require(required.file)
      }
    })
  }
  return command.run(client, message, requires)
}

var plugins = []
functions.loadPlugins()

client.addListener('error', function (content) {
  console.log('error: ', content)
})

client.addListener('message', function (from, to, content) {
  var builtin_found = false
    , plugin_found = false
  console.log(from + ' said ' + content + ' to ' + to)

  builtin_found = builtins.some(function (command) {
    if (checkCommand(command, from, to, content).status === 'success') {
      return true
    }
    return false
  })

  if (!builtin_found) {
    plugins.some(function (command) {
      var result = checkCommand(command, from, to, content)

      switch (result.status) {
        case 'fail':
          break
        case 'update':
          if (result.hasOwnProperty('file') && result.hasOwnProperty('data')) {
            functions.updateFile(result.file, result.data)
            console.log(result.file + ' updated.')
          }
        case 'success':
          return true
      }
      return false
    })
  }

})
