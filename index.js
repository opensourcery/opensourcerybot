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
      var filename = path.resolve('./lib/plugins/' + name);
      delete require.cache[filename];
      var plugin = require('./lib/plugins/' + name)
      plugins.push(plugin)
    })
  },
  checkCommand: function (command, args) {
    return command.run({
      client: client,
      to: args.to,
      from: args.from,
      message: args.message,
      config: config
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
    run: function (args) {
      if (args.to == args.config.handle) {
        var result = /^!reload$/.exec(args.message)
        if (result) {
          functions.loadPlugins()
          args.client.say(args.from, 'Reloaded definition files.')
          return true
        }
      }
      return false
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
    run: function (args) {
      var allbuiltinnames = builtins.map(function(elem) {
        return elem.name
      }).join(", ")
        , allpluginnames = plugins.map(function(elem) {
        return elem.name
      }).join(", ")
      
      var helpfunction
      var result = /^!help\s?(\S*)?$/.exec(args.message)
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
                helpfunction = plugins.help()
              }
            })
          }
          if (helpfunction) {
            args.client.say(args.to, 'Usage: ' + helpfunction.usage + ', ' + helpfunction.description)
            return true
          }
          else {
            args.client.say(args.to, 'Sorry, function not found or has no help info.')
            return true
          }
        }
        else {
          args.client.say(args.to, 'Possible commands: ' + allbuiltinnames + ', ' + allpluginnames)
          return true
        }
      }
      return false
    }
  }
]

var plugins = []
functions.loadPlugins()

client.addListener('error', function(message) {
        console.log('error: ', message);
});

client.addListener('message', function(from, to, message) {
  console.log(from + ' said ' + message + ' to ' + to)

  builtins.forEach(function (command) {
    if (functions.checkCommand(command, {
      to: to,
      from: from,
      message: message
    })) {
      return
    }
  })

  plugins.forEach(function (command) {
    if (functions.checkCommand(command, {
      to: to,
      from: from,
      message: message
    })) {
      return
    }
  })

})
