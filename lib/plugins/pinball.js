exports.name = 'pinball';

var pinballfile = './lib/bin/pinball.json';

exports.requires = [
  {
    name: 'storedpinball',
    file: pinballfile
  }
];

exports.help = [
  {
    usage: '!pinball [user] [table] [score]',
    description: 'Adds a high score to a user\'s list on a given pinball table.'
  },
  {
    usage: '!pinballtable',
    description: 'Lists all tables with registered scores.'
  },
  {
    usage: '!pinballtable [table]',
    description: 'Lists the registered high scores on a given table.'
  },
  {
    usage: '!pinballplayer',
    description: 'Lists the registered pinball users.'
  },
  {
    usage: '!pinballplayer [user]',
    description: 'Lists the registered tables for a given user.'
  },
  {
    usage: '!pinballplayer [user] [table]',
    description: 'Lists a user\'s registered high scores on a given table.'
  }
];

exports.run = {
  onmessage: function (client, message, requires) {

    var scores_by_user = requires.pinball.storedpinball;
    var scores_by_table = exports.functions.pinballRecalcTables(scores_by_user);
    var user,
        table,
        score;

    // Someone is failing at adding a new pinball score.
    var result = /^!pinball$/.exec(message.content);
    if (result) {
      client.speak(message, 'Proper usage of `!pinball` includes user, table, and score to record. For more help type `!help pinball`.');
      return {status:'success'};
    }

    // Someone is adding a new pinball score.
    var result = /^!pinball\s+(\S+)\s+(\S+)\s+([\d,]+)$/.exec(message.content);
    if (result) {
      user = result[1];
      table = result[2];
      score = parseInt(result[3]);

      if (isNaN(score)) {
        client.speak(message, 'I couldn\'t recognize that pinball score, ' + user + '!');
        return {status: 'success'};
      }

      if (user && table && score) {
        if (!scores_by_user[user]) {
          scores_by_user[user] = {};
          client.speak(message, 'Congrats on recording your first pinball score, ' + user + '!');
        }
        if (!scores_by_user[user][table]) {
          scores_by_user[user][table] = []
        }
        scores_by_user[user][table].push(score);
        client.speak(message, 'New score recorded for table "' + table + '" and player "' + user + '".');
        scores_by_user[user][table].sort();
        scores_by_table = exports.functions.pinballRecalcTables(scores_by_user);

        if (scores_by_table[table][0] ===  score) {
          client.speak(message, 'A new table high score for "' + table + '"!!!');
        }
        if (scores_by_user[user][table][0] === score) {
          client.speak(message, 'A new personal best on "' + table + '", ' + user + '!');
        }
      }
      return {status:'success'};
    }

    return {status:"fail"};
  }
};

exports.functions = {
  pinballRecalcTables: function(scores_by_user) {
    var scores_by_table = {};
    for (var user in scores_by_user) {
      for (var table in scores_by_user[user]) {
        if (!scores_by_table[table]) {
          scores_by_table[table] = [];
        }
        if (scores_by_user[user][table].length > 0) {
          scores_by_user[user][table].sort(); // Re-sort just in case, so the highest score is 0
          scores_by_table[table].push({user:user,score:scores_by_user[user][table][0]});
        }
      }
    }

    for (var table in scores_by_table) {
      scores_by_table[table].sort(sortByScore);
    }

    var sortByScore = function(a, b) {
      if (a.score < b.score) {
        return -1;
      }
      else if (a.score > b.score) {
        return 1;
      }
      else {
        return 0;
      }
    };

    return scores_by_table;
  }
};