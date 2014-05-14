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
    usage: '!pinballtable [table] (amount)',
    description: 'Lists the registered high scores on a given table, with a default amount of 4'
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
        tables = [],
        players = [],
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

    // Someone wants a list of tables
    var result = /^!pinballtable$/.exec(message.content);
    if (result) {
      var tableslist;
      for (var table in scores_by_table) {
        tables.push(table);
      }
      tableslist = tables.join(', ');
      client.speak(message, 'Current tables with scores: ' + tableslist);
      return {status:'success'};
    }

    // Someone wants the top scores of a table
    var result = /^!pinballtable\s+(\S+)\s?(\d+)?$/.exec(message.content);
    if (result) {
      table = result[1];
      var amount = result[2] ? result[2] : 4;
      if (scores_by_table.hasOwnProperty(table)) {
        client.speak(message, 'Top ' + amount + ' scores on ' + table + ':');
        for (var i = 0;i < amount;i++) {
          if (scores_by_table[table][i]) {
            client.speak(message, '#' + (i+1) + ': ' + scores_by_table[table][i].user + ' with ' + scores_by_table[table][i].score);
          }
        }
      }
      else {
        client.speak(message, 'I don\'t recognize that table, ' + client.from);
      }
      return {status:'success'};
    }

    // Someone wants a list of players
    var result = /^!pinballplayer$/.exec(message.content);
    if (result) {
      var playerslist;
      for (var player in scores_by_user) {
        players.push(player);
      }
      playerslist = players.join(', ');
      client.speak(message, 'Current players with scores: ' + playerslist);
      return {status:'success'};
    }

    // Someone wants a list of registered tables on a user
    var result = /^!pinballplayer\s+(\S+)$/.exec(message.content);
    if (result) {
      player = result[1];
      if (scores_by_user.hasOwnProperty(player)) {
        var tableslist;
        for (var table in scores_by_user[player]) {
          tables.push(table);
        }
        tableslist = tables.join(', ');
        client.speak(message, 'Player ' + player + ' has registered scores on the following tables: ' + tableslist);
      }
      else {
        client.speak(message, 'I don\'t recognize that player, ' + client.from);
      }
      return {status:'success'};
    }

    // Someone wants a list of registered scores on a table for a user
    var result = /^!pinballplayer\s+(\S+)\s+(\S+)$/.exec(message.content);
    if (result) {
      player = result[1];
      table = result[2]
      if (scores_by_user.hasOwnProperty(player) && scores_by_user[player].hasOwnProperty(table)) {
        client.speak(message, 'Top 5 scores by ' + player + ' on ' + table + ':');
        for (var i = 0;i < 5;i++) {
          if (scores_by_table[table][i]) {
            client.speak(message, '#' + (i+1) + ': ' + scores_by_table[table][i].score);
          }
        }
      }
      else if (scores_by_user.hasOwnProperty(player)) {
        client.speak(message, 'I don\'t recognize that table for that player, ' + client.from);
      }
      else {
        client.speak(message, 'I don\'t have any recorded scores for that player, ' + client.from);
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