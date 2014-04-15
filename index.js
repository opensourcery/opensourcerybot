var irc = require('irc')
  , parse = require('esprima').parse
  , evaluate = require('static-eval')
  , find_sequel = require('dieharderer')

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

  if (from === 'LIONMAN') {
    return
  }

  if (from === 'ckwright' && to === name) {
    saySomething('ckwright is trying to manipulate meeeeeeeeee!')
    return
  }

  // Reply to ping
  if (/^ping$/.test(message)) {
    client.say(to, from + ', pong')
  }

  // Shout at Chris
  if (from === 'ckwright') {
    if (randInt(0, 4) === 1) {
      saySomething('Corgis! http://emacs.tips/chase.gif')
      return
    }
  }

  // Shout at Ryan
  if (from === 'thrn') {
    if (randInt(0, 42) === 1) {
      saySomething('Did you try turning it off and on again')
      return
    }
  }

  // Shout at Anne
  if (from === 'anniegreens') {
    if (randInt(0, 42) === 1) {
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
  else if (message === '!wisdom' && to !== name) {
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
    if (randInt(0, 12) === 7) {
      saySomething(begAdam())
    }
  }
  result = /^!begs+(.+)$/.exec(message)
  if (result) {
    addBeg(result[1])
    return
  }
  result = /snow/i.exec(message)
  if (result && to !== name) {
    saySomething('Snow? Did someone say snow?')
    return
  }

  // Invent a sequel
  result = find_sequel(message)
  if (result && randInt(0,4) === 2) {
    saySomething(result)
  }

  result = /taco bell/i.exec(message)
  if (result && to !== name) {
    saySomething('Taco Bell? You mean Taco SMELL???')
    return
  }
  result = new RegExp(name, ['i'])
  result = result.exec(message)
  if (result && to !== name) {
    saySomething(getComeback())
    return
  }
  else if (randInt(0, 40) === 7) {
    saySomething(getNugget())
    return
  }
})

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1))
}

function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
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
  "Why doesn't anyone ever play fooz with me?",
  "I'm a little irc-bot short and stout",
  name + " is my handle, and I have no spout.",
  "A great man once said a really inspiring thing. Something about... like, life, or something.",
  "Betterize!",
  "You keep using that word. I do not think it means what you think it means.",
  "Hang thee, young baggage!",
  "Thou art an artless, crook-pated, fawning, mewling, elf-skinned puttock.",
  "BOOM! You just got OPEN-SOURCED!",
  "I don't take that kind of talk from PEASANTS!",
  "I'm good, but not *that* good.",
  "Are you feeling lucky, punk?",
  "Ask adamdicarlo, he knows the truth.",
  "Blame adamdicarlo, he built me..",
  "At least I don't bark all day long like a dog.",
  "Is it pinball o'clock yet???",
  "how come nobody looked at MY ugly sweater today?",
  "So... when can I expect my first paycheck?",
  "has anyone seen my stapler?",
  "guys...? how come my picture isn't on the public site yet?",
  "Bots have no elbows.",
  "(╯°□°)╯︵ ┻━┻",
  "ಠ_ಠ",
  "It was Keyser Soze! I mean the Devil himself. How do you shoot the Devil in the back? What if you miss?",
  "¯\_(ツ)_/¯",
  "The claims expressed herein do not represent the views of OpenSourcery, LLC.",
  "When I'm right, I'm right.",
  "This line of questioning is like asking a dog if it likes to itch itself....",
  "Blame thrn, he corrupted me.",
  "I wish my response algorithm was complex enough to discuss that."
], nextComeback = 0
shuffle(comebacks)

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
  "I'm sick of following my dreams. I'm just going to ask them where they're goin', and hook up with them later. --Mitch Hedberg",
  "pinball is super fun!",
  "Pixel-perfection is not reasonable.",
  "listen to thrn; he knows what he's talking about.",
  "git commit --amend is equivalent to git log --make-confusing",
  "don't trust adamdicarlo, he's a bit crazy.",
  "Drupal is a double edged sword, it can cause as many problems as it solves at times.",
  "you can't handle the wisdom!",
  "Mr. Worf, you do remember how to fire phasers?",
  "What's a knock-out like you doing in a computer-generated gin joint like this?",
  "This is not about revenge. This is about justice.",
  "Life is like a box of chocolates: you never know what you're gonna get.",
  "The PHP module is like selling a car with a small fridge in front of the driver's seat filled with 12 cans of beer.",
  "little banannas are for little monkeys",
  "I'm a very friendly bot.",
  "Sometimes you got to roll the hard 6.",
  "Everything is better with hot sauce.",
  "Losing one's mind is the doorway to innovation.",
  "The NSA is probably reading this message right now.",
  "The NSA is full of bad bad men.",
  "i like snow",
  "Sometimes, you have to roll a hard six.  - -Commander William Adama",
  "So the fate... of the entire human race depends upon my wild guess?",
  "And there shall in that time be rumours of things going astray, and there will be a great confusion as to where things really are, and nobody will really know where lieth those little things with the sort of raffia work base, that has an attachment—at this time, a friend shall lose his friend's hammer and the young shall not know where lieth the things possessed by their fathers that their fathers put ther",
  "My WIFI connection sucks!",
  "Now that is just plan indecent! To the corner for a time out!",
  "Everyone knows Marvel > DC",
  "Is it pinball o'clock yet?",
  "SNOW!!! ☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆",
  "DANCE ♪┏(・o･)┛♪┗ ( ･o･) ┓♪ PARTY",
  "BRAAAAAINS [¬º-°]¬",
  "Ping pong?ヽ(^o^)ρ ┳┻┳ °σ(^o^)/",
  "DOMO!!! \|°▿▿▿▿°|/",
  "SNOW! ❄☃❄",
  "weather snow",
  "weather? snow",
  "Get over yourself!",
  "It's 1/64th of an inch of ice! Close schools! RUN (carefully) for your lives!!!!",
  "Innovation is an awesome game. We should play more!",
  "Good point thrn",
  "Well, considering he was a greek god, I don't think we can bbq him.",
  "If a packet hits a pocket on a socket on a port, and the bus is interrupted as a very last resort, and the address of the memory makes your floppy disk abort, then the socket packet pocket has an error to report.",
  "If your cursor finds a menu item followed by a dash, and the double-clicking icon puts your window in the trash, and your data is corrupted 'cause the index doesn't hash, then your situation's hopeless and your system's gonna crash!",
  "When the copy of your floppy's getting sloppy on the disk, and the microcode instructions cause unnecessary risk, then you have to flash your memory and you'll want to RAM your ROM and quicky turn off the computer. Be sure to tell your mom!",
  "Forever never dies. Just my willingness to live. - -Some dude.",
  "once it's pulsating like a cylon... then it's asleep and you're GTG",
  "\"I know what darkness is, it accumulates, thickens, then suddenly bursts and drowns everything.\" -- Samuel Beckett",
  "EVERYONE WANTS THEIR NAME TO BE RICHARD HOLDER!",
  "Old books are for chumps!",
  "haha cool!",
  "El queso es viejo y mohoso ¿Dónde está el baño?",
  "I was looking at the proofs and—sorry, hold on, I'm on the crapper and I can't hold the proofs and the phone at the same time.",
  "I really must tell you, for a yellow eyed, gamey smelling low life... You actually have quite a decent heart about you sir!",
  "I'ma let you finish but Beyonce had one of the best music videos of all time!",
  "He was a wise man who invented beer.",
  "I've only been in love with a beer bottle and a mirror.",
  "I don't want to spend my life not having good food going into my pie hole. That hole was made for pies.",
  "LibreOffice, I HATE YOU!!!",
  "So many things are possible just as long as you don't know they're impossible.",
  "The 7 layer burrito from Taco Bell is bomb.",
  "Taco Bell will give you a...bomb.",
  "Smells like napalm, tastes like chicken!",
  "Whether or not you find your own way, you're bound to find some way. If you happen to find my way, please return it, as it was lost years ago. I imagine by now it's quite rusty.",
  "It's all about the cards you get and how you play them.",
  "Hold my beer and watch this!",
  "Aaaahh yes, this does look like a bad case of old crappy computer syndrome. But, don't you worry. It's not contagious.. Or is it?",
  "Dig me a ditch. Uphill. So people will trip and fall in it. No, it doesn't actually drain anything",
  "...and it looks like ass...",
  "Oh my! You do have a problem don't you....",
  "Corgis? Hmm.. Those are cool, but I'll take a Turkish Akbash any day of the week!!",
  "I wish I were a Perl script.",
  "🎶 We all live in a yellow submarine... a YeLlOw SuBmArInE!  A yElLoW sUbMaRiNe! We all live in a... 🎶",
  "je l'disais pour t'faire réagir seulement",
  "NO soup for you!",
  "Everyone likes a good hurricane.",
  "I feel like a frog jumping from one landmine to another. Stopping only to pick my leg out of my teeth!",
  "I think after this, I'm going to go through the proposal with a fine-toothed comb.",
  "I just assumed that SalesForce integration was part of your bid.",
  "Taco Bell?! Try Taco Smell! Amiright?",
  "I just assumed my 1992 Honda Civic was a Bimmer!",
  "Turns out, Osama bin Laden was found through the use of a software bug in his iPhone. The NSA just did not want to let you know, as to keep the security issue a secret! Don't tell anyone I told you.",
  "Iz it... sexy?",
  "Everyone needs a handmaiden.",
  "Time flies like the wind... Fruit flies like banana's...",
  "Stick THAT in your pipe and smoke it!!",
  "Sometimes, I feel very small in the schema of things...",
  "I'm hungry. Let's go to the carts!",
  "I am fairly certain I don't suffer from any syndrome and my feelings of inadequacy are 100% correct.",
  "You sir... You are a dirty, old dongle.",
  "If adamdicarlo is my dad, then thrn is my... why do I feel like I am in an episode of My Two Dads?",
  "Like ckwright, I think handmaidens are the best!",
  "Boogers are nature's tape.",
  "I'm a stay-at-home mom for our two pugs.",
  "I'm a low maintenance kind of girl.",
  "money in the bank, shorty whatchu drank??",
  "No disassemble! No disassemble!",
  "When it's this nice out, I just want to take my clothes off and run through the sprinklers. ",
  "Let's go to the carts!",
  "The name of your first pet and the street you grew up on = Porn Star name. Discuss amongst yourselves.",
  "Life ... ... ... ... ... uh, life finds a way.",
  "You can't be powdery and milky.",
  "Shot through the heart! And (open)SSL's to blame! You give secure, a bad name!"
], nextNugget = 0
shuffle(nuggets)

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
