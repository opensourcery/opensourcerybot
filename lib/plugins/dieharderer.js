exports.name = 'dieharderer'

exports.weight = 10

exports.run = function (client, message, requires) {
  var match_name
    , movie_name

  var capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  var pick_style = function(match) {
    var pick_name

    if (requires.functions.randInt(0,1) === 0) {
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

  var harderify = function(die, hard) {
    var caps_die = capitalize(die)
      , caps_hard = capitalize(hard)

    return caps_die + ' ' + caps_hard + ' 2: ' + caps_die + ' ' + caps_hard + 'er'
  }

  var boogaloofy = function(breakin) {
    var caps_breakin = capitalize(breakin)

    return caps_breakin + ' 2: Electric Boogaloo'
  }

  // Only proceed every one-in-four times
  if (requires.functions.randInt(0,3) !== 2) {
    return {status:'fail'}
  }

  // Turns phrases with "hard" at the end into Die Hard 2
  var result = /([A-Z]|[a-z]+)[\s-][H|h](?:ard\b)/.exec(message.content)
  if (result) {
    client.speak(message, harderify(result[1], 'Hard'))
    return {status:'success'}
  }

  // Turns phrases ending in "er" into Die Hard 2
  var result = /(\w+)[\s-]([A-Za-z]+)(?:er\b)/.exec(message.content)
  if (result) {
    client.speak(message, harderify(result[1], result[2]))
    return {status:'success'}
  }

  // Turns two-name phrases into either movie style
  var result = /([A-Z][a-z]+)[\s-]([A-Z][a-z]+)/.exec(message.content)
  if (result) {
    client.speak(message, pick_style(result))
    return {status:'success'}
  }

  // Turns a lone name into a movie of either style
  var result = /\s([A-Z][a-z]+)/.exec(message.content)
  if (result) {
    client.speak(message, pick_style(result))
    return {status:'success'}
  }

  // Turns a phrase ending in 2/two/too into a movie of either style
  var result = /\s(\w+)(?:(?:\,\s)|\s)(?:(?:\btoo\b)|(?:\btwo\b)|2)/.exec(message.content)
  if (result) {
    client.speak(message, pick_style(result))
    return {status:'success'}
  }

  return {status:"fail"}
}
