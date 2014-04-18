var irc = require('irc')
  , fs = require('fs')
  , path = require('path')
  , parse = require('esprima').parse
  , evaluate = require('static-eval')

var config = require('./config')

var client = new irc.Client(config.network, config.handle, {
  channels: config.channels
})

var functions = {
  loadPlugins: function () {
    plugins = []
    fs.readdirSync('./lib/plugins').forEach(function (name) {
      var filename = path.resolve('./lib/plugins/' + name)
      delete require.cache[filename]
      var plugin = require('./lib/plugins/' + name)
      plugins.push(plugin)
    })
  },
  checkCommand: function (command, from, to, message) {
    var requires = {}
    var data = {
      to: to,
      from: from,
      message: message
    }
    if (command.requires) {
      command.requires.forEach(function (required) {
        if (required.name && required.file) {
          requires[required.name] = require(required.file)
        }
      })
    }
    return command.run(client, data, config, requires)
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
    help: function () {
      return {
        usage: '!reload',
        description: 'Reloads all definition files'
      }
    },
    run: function (client, data) {
      var result = /^!reload$/.exec(data.message)
      if (result) {
        functions.loadPlugins()
        client.say(data.to, 'Reloaded definition files.')
        return {status:"success"}
      }
      return {status:"fail"}
    }
  },
  {
    name: 'help',
    help: function () {
      return {
        usage: '!help [command]',
        description: 'Gives more information about a command, or lists all commands.'
      }
    },
    run: function (client, data) {
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

      var helpfunction
      var result = /^!help\s?(\S*)?$/.exec(data.message)
      if (result) {
        if (result[1]) {
          builtins.forEach(function (builtin) {
            if (builtin.name === result[1] && builtin.hasOwnProperty('help')) {
              helpfunction = builtin.help()
            }
          })
          if (!helpfunction) {
            plugins.forEach(function (plugin) {
              if (plugin.name === result[1] && plugin.hasOwnProperty('help')) {
                helpfunction = plugin.help()
              }
            })
          }
          if (helpfunction) {
            client.say(data.to, 'Usage: ' + helpfunction.usage + ', ' + helpfunction.description)
          }
          else {
            client.say(data.to, 'Sorry, function not found or has no help info.')
          }
        }
        else {
          client.say(data.to, 'Possible commands: ' + allbuiltinnames + ', ' + allpluginnames)
        }
        return {status:"success"}
      }
      return {status:"fail"}
    }
  }
]

var plugins = []
functions.loadPlugins()

client.addListener('error', function(message) {
  console.log('error: ', message)
})

client.addListener('message', function(from, to, message) {
  console.log(from + ' said ' + message + ' to ' + to)

  builtins.forEach(function (command) {
    if (functions.checkCommand(command, from, to, message).status === 'success') {
      return
    }
  })

  plugins.forEach(function (command) {
    var result = functions.checkCommand(command, from, to, message)

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
