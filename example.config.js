var config = {};

config.handle = 'osbot';

config.network = 'irc.freenode.net';

config.disable = ['silly.js'];

config.params = {
  channels: ['#examplechannel'],
  userName: config.handle,
  nick: config.handle,
  password: 'your_password_here',
  sasl: true,
  realName: 'OpenSourcery IRC Bot'
};

config.github = {
  user: 'your user',
  email: 'your user email',
  password: 'password',
  repo: 'the repo of your bot',
  token: 'your user token'
};

module.exports = config;
