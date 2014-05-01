exports.name = 'alarm';

exports.help = [
  {
    usage: '!alarm [hour] [minute] ([month]/[day]) ([event]) ',
    description: 'Sets an alarm for a given event at a specific time, PST.'
  }
];

exports.run = {
  onmessage: function (client, message) {
    var result,
        hour,
        minute,
        month = 0,
        day = 0,
        date,
        event = '';
      
    result = /^!alarm\s+(\d+)[\s:](\d+)\s?(\d+[\/\\]\d+)?\s?(.*)?$/.exec(message.content);
    if (result) {
      if (result[1] && result[2]) {
        hour = result[1];
        minute = result[2];
        
        if (result[4]) {
          date = result[3].split('/');
          if (date.length < 2) {
            date = result[3].split('\\');
          }
          month = date[0]-1; // This needs to be between 0 and 11, for whatever reason.
          day = date[1];
          event = result[4];
        }
        else if (result [3]) {
          event = result[3];
        }
        
        setAlarm(event, hour, minute, month, day, client, message);
        client.speak(message, 'Setting alarm ' + (event ? '"' + event + '" ' : '') + 'for ' + hour + ':' + minute + (month ? ' on ' + (month+1) + '/' + day : ' today') + '.');
      }
      else {
        client.speak(message, 'I didn\'t understand that alarm command, ' + message.from);
      }
      return {status:'success'};
    }
    return {status:'fail'};
  }
};

function setAlarm(name, hour, minute, month, day, client, message) {
  var now = new Date();
  var goTime = new Date(now.getFullYear(), month === 0 ? now.getMonth() : month, day === 0 ? now.getDate() : day, +hour, +minute, 0);
  var interval = goTime.getTime() - now.getTime();

  console.log('Scheduling "' + name + '" for ' + goTime);
  console.log('(' + interval + 'ms from now)');

  setTimeout(function() {
    client.speak(message, 'ALERT! It is now time for ' + (name !== '' ? name : 'whatever') + '!');
  }, interval);
}