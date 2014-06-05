exports.name = 'alarm';

exports.help = [
  {
    usage: '!alarm [hour] [minute] ([month]/[day]) ([event]) ',
    description: 'Sets an alarm for a given event at a specific time, PST.'
  }
];

exports.run = {
  alarm: function (client, message, args) {
    var hour,
        minute,
        month = 0,
        day = 0,
        date,
        event = '';
    if (args[0] && args[1]) {
      hour = args[0];
      minute = args[1];

      if (args[2]) {
        date = args[2].split('/');
        if (date.length < 2) {
          date = args[2].split('\\');
        }
        month = date[0]-1; // This needs to be between 0 and 11, for whatever reason.
        day = date[1];
        event = args[3];
      }
      else if (args[3]) {
        event = args[2];
      }

      setAlarm(event, hour, minute, month, day, client, message);
      client.speak(message, 'Setting alarm ' + (event ? '"' + event + '" ' : '') + 'for ' + hour + ':' + minute + (month ? ' on ' + (month+1) + '/' + day : ' today') + '.');
    }
    else {
      client.speak(message, 'I didn\'t understand that alarm command, ' + message.from);
    }
    return {status:'success'};
  }
};

function setAlarm(name, hour, minute, month, day, client, message) {
  var now = new Date();
  var goTime = new Date(now.getFullYear(), month === 0 ? now.getMonth() : month, day === 0 ? now.getDate() : day, +hour, +minute, 0);
  var interval = goTime.getTime() - now.getTime();

  console.log('Scheduling "' + name + '" for ' + goTime);
  console.log('(' + interval + 'ms from now)');

  setTimeout(function() {
    client.speak(message, 'ALARM, ' + message.from + '! It is now time for ' + (name !== '' ? name : 'whatever') + '!');
  }, interval);
}