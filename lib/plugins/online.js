exports.name = 'online';

exports.help = [
  {
    usage: '!online',
    description: 'PMs a list of users online.'
  },
  {
    usage: '!online [user]',
    description: 'PMs if a user is online or not.'
  }
];

exports.run = {
  onmessage: function (client, message) {
    var result,
        users_list = [];

    result = /^!online$/.exec(message.content);
    if (result) {
      users_list = exports.functions.checkOnline(client);

      client.say(message.from, 'Users online: ' + users_list.join(', '));

      return {status:'success'};
    }
    return {status:'fail'};
  }
};

exports.functions = {

  /**
   * Checks who is online across all channels OSBot is in.
   * If an array of names is specified, just finds out if those users are online.
   *
   * @params
   *  client (object) - The standard osbot client object.
   *  names (array) - Optional array of users to check for online status.
   *  channels (array) - Optional array of channels to check.
   *
   * @return an array of users online, either of all users or pruned from the
   * names parameter.
   */
  checkOnline: function(client, names, channels) {
    var online_users = [];
    if (!channels) {
      channels = client.config.params.channels;
    }
    if (channels.length > 0) {
      for (var key in channels) {
        // Loop through the channels and their individual user lists.
        var channel_data = client.chanData(channels[key]);
        if (channel_data) {
          var channel_users = channel_data.users;
          for (var user in channel_users) {
            if (online_users.indexOf(user) < 0) {
              // Do an additional check if we have a names array, and don't add it
              // to online_users if this user isn't on the names.
              if (names && names.length > 0 && names.indexOf(user) > -1) {
                online_users.push(user);
              }
              else if (!names && user != client.config.handle) {
                online_users.push(user);
              }
            }
          }
        }
      }
    }

    return online_users;
  }
};