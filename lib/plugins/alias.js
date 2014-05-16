exports.name = 'alias';

exports.weight = 0;

var aliasfile = './lib/data/alias.json';

exports.requires = [
  {
    name: 'storedalias',
    file: aliasfile
  }
];

exports.help = [
  {
    usage: '!alias [alias] (to) [name]',
    description: 'Stores a unique alias of a name (or other alias).'
  },
  {
    usage: '!aliascheck [name]',
    description: 'Shows all (other) aliases shared with a given alias.'
  },
  {
    usage: '!aliasremove [alias]',
    description: 'Removes an alias from memory.'
  }
];

exports.run = {
  onmessage: function (client, message, requires) {
    var newalias,
        oldalias,
        userid;
    var aliasbyid = requires.alias.storedalias;

    var result = /^!wisdom$/.exec(message.content);
    if (result) {
      client.speak(message, getNugget());
      return {status:'success'};
    }

    // Someone wants to add an alias
    var result = /^!alias (\S+) (?:to\s)(\S+)$/.exec(message.content);
    if (result && result[1] && result[2]) {
      newalias = result[1]
      oldalias = result[2];
      
      if (exports.functions.aliasFind(requires, newalias)) {
        // Alias is taken.
        client.speak(message, 'Sorry, ' + message.from + ', ' + newalias + ' is already aliased!');
      }
      else if (exports.functions.aliasFind(requires, oldalias) !== undefined) {
        // Name is already an alias, so find the userid of its alias group.
        userid = exports.functions.aliasFind(requires, oldalias);
        if (aliasbyid[userid]) {
          console.log('Adding alias "' + newalias + '" to existing userid ' + userid);
          client.speak(message, 'Added alias ' + newalias + ' to the same alias group as ' + oldalias + '.');
          aliasbyid[userid].push(newalias);
        } else {
          console.log('aliasbyid['+userid+'] does not match idbyalias somehow!');
          client.speak(message, 'Sorry, ' + message.from + ', something went terribly wrong with my alias system!');
        }
      }
      else {
        // Need to assign a new userid.
        userid = aliasbyid.push([newalias,oldalias]) - 1; // Push returns length, so subtract one.
        console.log('Adding alias "' + newalias + '" to new userid ' + userid);
        client.speak(message, 'Added alias ' + newalias + ' to the same alias group as ' + oldalias + '.');
      }
      return {status:'update', file:aliasfile, data:aliasbyid};
    }

    return {status:"fail"};
  }
};

exports.functions = {
  /**
   * Find the user ID by a given alias.
   *
   * @params
   *  requires (object) The standard osbot requires object.
   *  to (string) The alias to find the user ID of.
   *
   * @return (int) the ID of the user.
   */
  aliasFind: function(requires, alias) {
    var aliasbyid = requires.alias.storedalias;
    var idbyalias = exports.functions.aliasSortByAlias(aliasbyid);
    var userid;
    
    if (idbyalias.hasOwnProperty(alias)) {
      userid = idbyalias[alias];
      console.log('found userid is ' + userid);
    }

    return userid;
  },
  /**
   * Sort an array of alias arrays into an object of aliases with their user ID as values.
   *
   * @params
   *  aliasbyid (array) An array of arrays, with the parent array keys representing user IDs.
   *
   * @return (object) Aliases with their user IDs as values
   */
  aliasSortByAlias: function(aliasbyid) {
    var idbyalias = {}
    
    if (aliasbyid.length > 0) {
      aliasbyid.forEach(function(aliaslist,userid) {
        if (aliaslist.length > 0) {
          aliaslist.forEach(function(alias) {
            idbyalias[alias] = userid;
          });
        }
      });
    }
    console.log(idbyalias);
    return idbyalias;
  }
};