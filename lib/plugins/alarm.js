exports.name = 'alarm'

exports.help = function () {
  return {
    usage: '!alarm [event] [hour] [minute]',
    description: 'Sets an alarm for a given event at a specific time, PST.'
  }
}

exports.run = function (args) {
  var result = /^!alarm\s+(.+)\s+(\d+)\s+(\d+)$/.exec(args.message)
  
  if (result) {
    if (result[1] && result[2] && result[3]) {
      setAlarm(result[1], result[2], result[3], args)
      args.client.say(args.to, 'Setting alarm "' + result[1] + '" for ' + result[2] + ':' + result[3])
    }
    else {
      args.client.say(args.to, 'I didn\'t understand that alarm command, ' + args.from)
    }
    return true
  }
  return false
}

function setAlarm(name, hour, minute, args) {
  var now = new Date()
  var goTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), +hour, +minute, 0)
  var interval = goTime.getTime() - now.getTime()

  console.log('Scheduling "' + name + '" for ' + goTime)
  console.log('(' + interval + 'ms from now)')

  setTimeout(function() {
    args.client.say(args.to, 'ALERT! It is now time for ' + name + '!')
  }, interval)
}