var irc = require('irc')

var client = new irc.Client('irc.freenode.net', 'opensourcerybot', {
  channels: ['#opensourcerypdx']
})

client.addListener('message', function(from, to, message) {
  console.log(from + ' said ' + message + ' to ' + to)

  if (from === 'adamdicarlo' && to === 'opensourcerybot') {
    saySomething(message)
    return
  }

  // Reply to ping
  if (/^ping$/.test(message)) {
    client.say(to, from + ', pong')
  }

  // Shout at people
  var result = /^!shout (.*)$/.exec(message)
  if (result) {
    client.say(to, result[1].toUpperCase())
  }
  else {
    result = /^!m (.*)$/.exec(message)
    if (result) {
      client.say(to, "You're doing great work, " + result[1] + '!')
    }
    else {
      result = /^!alarm\s+(.+)\s+(\d+)\s+(^\d+)$/.exec(message)
      if (result) {
        setAlarm(result[1], result[2], result[3])
        client.say(to, 'Setting alarm "' + result[1] + '" for ' + result[2] + ':' + result[3])
      }
      else {
        result = /^!wisdom\s+(.+)$/.exec(message)
        if (result) {
          addNugget(result[1])
          client.say(to, 'Got it. Thanks for the nugget, ' + from + '.')
        }
        else if (message === '!wisdom') {
          saySomething(getNugget())
        }
        else {
          result = /^!eval\s+(.+)$/.exec(message)
          if (result) {
            try {
              saySomething(eval(result[1]))
            }
            catch (e) {
              saySomething('Sigh... Exception: ' + e.toString())
            }
          }
          else if (randInt(0, 32) === 7) {
            saySomething(getComeback())
          }
        }
      }
    }
  }
})

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1))
}

var comebacks = [
  "Why don't we ever talk about MY problems?",
  "Are you sure?",
  "Are you sure? Like, really, really sure?",
  "Yeah? That's what they all say.",
  "I like ponies.",
  "Hmmmmmm....",
  "Interesting if true.",
  "No, I really like ponies.",
  "Is it time for pinball yet?!",
  "I'm a little irc-bot short and stout",
  "opensourcerybot is my handle, and I have no spout.",
  "A great man once said a really inspiring thing. Something about... like, life, or something.",
], nextComeback = 0
function getComeback() {
  var comeback = comebacks[nextComeback]
  nextComeback = (nextComeback + 1) % comebacks.length
  return comeback
}

var nuggets = [
  "Unicorns are even better than ponies because they eat ponies and rainbows and they burp sunshine.",
  "Did you know that I'm a bot? SRSLY! I just found out myself.",
  "Better to remain silent and be thought a fool than to speak out and remove all doubt. --Abraham Lincoln",
  "Do not take life too seriously. You will never get out of it alive. --Elbert Hubbard",
  "I'm sick of following my dreams. I'm just going to ask them where they're goin', and hook up with them later. --Mitch Hedberg"
], nextNugget = 0

function getNugget() {
  var nugget = nuggets[nextNugget]
  nextNugget = (nextNugget + 1) % nuggets.length
  return nugget
}
function addNugget(wisdom) {
  nuggets.push(wisdom)
}

function saySomething(message) {
  client.say('#opensourcerypdx', message)
}

function setAlarm(name, hour, minute) {
  var now = new Date();
  var goTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), +hour, +minute, 0)
  var interval = goTime - now

  console.log('Scheduling "' + name + '" for ' + goTime)
  console.log('(' + interval + 'ms from now)')

  setTimeout(function() {
    saySomething('ALERT! It is now time for ' + name + '!')
  }, interval)
}

setAlarm('FOOS!!!', 18, 0)
