exports.name = 'alarm'

exports.help = function () {
  return {
    usage: '!alarm [event] [hour] [minute]',
    description: 'Sets an alarm for a given event at a specific time, PST.'
  }
}

exports.run = function (client, data) {
  var result = /^!alarm\s+(.+)\s+(\d+)\s+(\d+)$/.exec(data.message)

  if (result) {
    if (result[1] && result[2] && result[3]) {
      setAlarm(result[1], result[2], result[3], client, data)
      client.say(data.to, 'Setting alarm "' + result[1] + '" for ' + result[2] + ':' + result[3])
    }
    else {
      client.say(data.to, 'I didn\'t understand that alarm command, ' + data.from)
    }
    return {status:'success'}
  }
  return {status:'fail'}
}

function setAlarm(name, hour, minute, client, data) {
  var now = new Date()
  var goTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), +hour, +minute, 0)
  var interval = goTime.getTime() - now.getTime()

  console.log('Scheduling "' + name + '" for ' + goTime)
  console.log('(' + interval + 'ms from now)')

  setTimeout(function() {
    client.say(data.to, 'ALERT! It is now time for ' + name + '!')
  }, interval)
}