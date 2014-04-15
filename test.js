var comma_too = "I want to come, too."
  , no_comma_too = "There are bats too!"
  , hard = "This is going to suck hard."
  , too = "I am coming too."
  , two = "There will be two of us."
  , name = "But what about Jeff?"
  , other_name = "We can see if Jeff can come."
  , two_name = "Let's see Lethal Weapon."
  
console.log(find_sequel(comma_too))
console.log(find_sequel(no_comma_too))
console.log(find_sequel(hard))
console.log(find_sequel(too))
console.log(find_sequel(two))
console.log(find_sequel(name))
console.log(find_sequel(other_name))
console.log(find_sequel(two_name))

function find_sequel(string) {
  var match_name
    , movie_name

  var harder_pattern = /([A-Z]|[a-z]+)[\s-][H|h][ard]/
    , two_name_pattern = /([A-Z][a-z]+)[\s-]([A-Z][a-z]+)/
    , one_name_pattern = /\s([A-Z][a-z]+)/
    , toos_pattern = /\s(\w+)(?:(?:\,\s)|\s)(?:(?:\btoo\b)|(?:\btwo\b)|2)/
    
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
      , random = Math.floor(Math.random()*2)

    if ( random === 0) { // replace with randInt(0,1) during implementation
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