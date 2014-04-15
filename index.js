var irc = require('irc')
  , parse = require('esprima').parse
  , evaluate = require('static-eval')

var name = 'opensourcerybot'

var client = new irc.Client('irc.freenode.net', name, {
  channels: ['#opensourcerypdx']
})
client.addListener('error', function(message) {
  console.log('error: ', message )
})

client.addListener('message', function(from, to, message) {
  console.log(from + ' said ' + message + ' to ' + to)

  if (from === 'thrn' && to === name) {
    saySomething(message)
    return
  }

  if (from === 'ckwright' && to === name) {
    saySomething(message)
    return
  }

  // Reply to ping
  if (/^ping$/.test(message)) {
    client.say(to, from + ', pong')
  }

  // Shout at Ryan
  if (from === 'thrn') {
    if (randInt(0, 12) === 1) {
      saySomething('Did you try turning it off and on again')
      return
    }
  }

  // Shout at Anne
  if (from === 'anniegreens') {
    if (randInt(0, 12) === 1) {
      saySomething('No, I\'m totally not biased against you! ಠ_ಠ')
      return
    }
  }

  // Shout at people
  var result = /^!shout (.*)$/.exec(message)
  if (result) {
    client.say(to, result[1].toUpperCase())
    return
  }
  result = /^!m (.*)$/.exec(message)
  if (result) {
    client.say(to, "You're doing great work, " + result[1] + '!')
    return
  }
  result = /^!alarm\s+(.+)\s+(\d+)\s+(\d+)$/.exec(message)
  if (result) {
    setAlarm(result[1], result[2], result[3])
    client.say(to, 'Setting alarm "' + result[1] + '" for ' + result[2] + ':' + result[3])
    return
  }
  result = /^!wisdom\s+(.+)$/.exec(message)
  if (result) {
    addNugget(result[1])
    client.say(to, 'Got it. Thanks for the nugget, ' + from + '.')
    return
  }
  else if (message === '!wisdom') {
    saySomething(getNugget())
    return
  }
  result = /^!comeback\s+(.+)$/.exec(message)
  if (result) {
    addComeback(result[1])
    client.say(to, 'Got it. Thanks for the comeback, ' + from + '.')
    return
  }
  result = /^!eval\s+(.+)$/.exec(message)
  if (result) {
    try {
      var ast = parse(result[1]).body[0].expression;
      saySomething(evaluate(ast))
      return
    }
    catch (e) {
      saySomething('Sigh... Exception: ' + e.toString())
      return
    }
  }
  if (from === 'andreathegiant') {
    if (randInt(0, 4) === 1) {
      saySomething(begAdam())
    }
  }
  result = /^!begs+(.+)$/.exec(message)
  if (result) {
    addBeg(result[1])
    return
  }
  result = /snow/i.exec(message)
  if (result) {
    saySomething('Snow? Did someone say snow?')
    return
  }
  // Invent a sequel
  result = find_sequel(message)
  if (result) {
    saySomething(result)
    return
  }
  result = new RegExp(name, ['i'])
  result = result.exec(message)
  if (result) {
    saySomething(getComeback())
    return
  }
  else if (randInt(0, 32) === 7) {
    saySomething(getNugget())
    return
  }
})

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1))
}

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x)
    return o
}

var comebacks = shuffle([
  "Why don't we ever talk about MY problems?",
  "Are you sure?",
  "Are you sure? Like, really, really sure?",
  "Yeah? That's what they all say.",
  "I like ponies.",
  "Hmmmmmm....",
  "Interesting if true.",
  "No, I really like ponies.",
  "Is it time for pinball yet?!",
  "Why doesn't anyone ever play fooz with me?",
  "I'm a little irc-bot short and stout",
  "opensourcerybot is my handle, and I have no spout.",
  "A great man once said a really inspiring thing. Something about... like, life, or something.",
  "Betterize!"
]), nextComeback = 0
function getComeback() {
  var comeback = comebacks[nextComeback]
  nextComeback = (nextComeback + 1) % comebacks.length
  return comeback
}

function addComeback(comeback) {
  comebacks.push(comeback)
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

var adambegs = [
  "...andreathegiant, don't go!",
  "STEPS!!!",
  "But does San Francisco have hipster mustaches? Oh wait...",
  "andreathegiant, I only barely got to know you...",
  "andreathegiant, don't leave me with these people!",
  "People say I'm wearing heels because I'm short. I wear heels because the women like 'em.",
  "What would Prince do?",
  "But Best Practices say...",
  "(σ・・)σ",
], nextAdam = 0

function begAdam() {
  var nugget = adambegs[nextAdam]
  nextAdam = (nextAdam + 1) % adambegs.length
  return nugget
}
function addBeg(wisdom) {
  adambegs.push(wisdom)
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

function find_sequel(string) {
  var match_name
    , movie_name

  var harder_pattern = /([A-Z]|[a-z]+)[\s-][H|h][ard]/ // Name Hard/hard
    , two_name_pattern = /([A-Z][a-z]+)[\s-]([A-Z][a-z]+)/ // Name Word
    , one_name_pattern = /\s([A-Z][a-z]+)/ // Word
    , toos_pattern = /\s(\w+)(?:(?:\,\s)|\s)(?:(?:\btoo\b)|(?:\btwo\b)|2)/ // Word two/too/2
    
  // Couldn't get this to work with a switch, stupidly. No idea what's up with that.
  var harder_match = harder_pattern.exec(string)
    , two_name_match = two_name_pattern.exec(string)
    , one_name_match = one_name_pattern.exec(string)
    , toos_match = toos_pattern.exec(string)
    
  if (harder_match) {
    movie_name = harderify(harder_match[1],'Hard')
  }
  else if (two_name_match) {
    movie_name = pick_style(two_name_match)
  }
  else if (one_name_match) {
    movie_name = pick_style(one_name_match)
  }
  else if (toos_match) {
    movie_name = pick_style(toos_match)
  }
  return movie_name

  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  function pick_style(match) {
    var pick_name

    if (randInt(0,1) === 0) {
      if (match.length > 2) {
        pick_name = harderify(match[1],match[2])
      }
      else {
        pick_name = harderify(match[1],'Hard')
      }
    }
    else if (match.length > 2) {
      pick_name = boogaloofy(match[1] + ' ' + capitalize(match[2]))
    }
    else {
      pick_name = boogaloofy(match[1])
    }
    return pick_name
  }

  function harderify(die, hard) {
    var caps_die = capitalize(die)
      , caps_hard = capitalize(hard)
      
    return caps_die + ' ' + caps_hard + ' 2: ' + caps_die + ' ' + caps_hard + 'er'
  }

  function boogaloofy(breakin) {
    var caps_breakin = capitalize(breakin)
    
    return caps_breakin + ' 2: Electric Boogaloo'
  }
}

setAlarm('PINBALL!!!', 18, 0)
