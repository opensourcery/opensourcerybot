var irc = require('irc')
  , fs = require('fs')
  , path = require('path')

var config = require('./config')

var client = new irc.Client(config.network, config.handle, config.params)

client.config = config // We put the config inside the client for easy grabbing should it come up in a plugin

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
    })
    plugins.sort(function(a, b) {
      return a.weight - b.weight
    })
  },
  checkCommand: function (command, from, to, content) {
    var requires = {}
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
  },
  updateFile: function (file, data) {
    var string = JSON.stringify(data)
    fs.writeFile(file, string, function(e) {
      if (e) {
        console.log(e)
      }
    })
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
        client.say(message.to, 'Reloaded definition files.')
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
        description: 'Lists all possible commands.'
      },
      {
        usage: '!help [command]',
        description: 'Gives more information about a command or command family.'
      }
    ],
    run: function (client, message) {
      var allbuiltinnames = builtins.map(function(elem) {
        if (elem.hasOwnProperty('help')) {
          return elem.name
        }
        else {
          return false
        }
      }).join(", ")
        , allpluginnames = plugins.map(function(elem) {
        if (elem.hasOwnProperty('help')) {
          return elem.name
        }
        else {
          return false
        }
      }).join(", ")

      var helpfunctions
      var command
      var result = /^!help\s?(\S*)?$/.exec(message.content)

      if (result) {
        var postTo
        if (message.to === client.config.handle) {
          postTo = message.from
        }
        else {
          postTo = message.to
        }
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
              client.say(postTo, 'Usage: ' + helpfunction.usage + ', ' + helpfunction.description)
            })
          }
          else {
            client.say(postTo, 'Sorry, function not found or has no help info.')
          }
        }
        else {
          client.say(postTo, 'Possible commands: ' + allbuiltinnames + ', ' + allpluginnames)
        }
        return {status:"success"}
      }
      return {status:"fail"}
    }
  }
]

var plugins = []
functions.loadPlugins()

client.addListener('error', function(content) {
  console.log('error: ', content)
})

client.addListener('message', function(from, to, content) {
  console.log(from + ' said ' + content + ' to ' + to)

  builtins.forEach(function (command) {
    if (functions.checkCommand(command, from, to, content).status === 'success') {
      return
    }
  })

  plugins.forEach(function (command) {
    var result = functions.checkCommand(command, from, to, content)

    switch (result.status) {
      case 'fail':
        break
      case 'update':
        if (result.hasOwnProperty('file') && result.hasOwnProperty('data')) {
          functions.updateFile(result.file, result.data)
          client.say(to, result.file + ' updated!')
        }
      case 'success':
        return
    }
  })

})
