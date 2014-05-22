opensourcerybot
===============

An IRC bot for fun at OpenSourcery.

Originally created for stupid sayings and small helper functions, OSbot has grown to the point of needing a proper README.

## Installation

0. Have `node.js` installed on your machine of choice
1. Clone this repo to a desired location that you have read/write access to
2. Copy and [complete the configuration file](#configuration) `example.config.js` to `config.js`
3. Run `node index.js`

## Configuration

An example of a completed configuration file has been provided with `example.config.js`, but you will need to modify it to match your personal settings prior to running OSbot. The following are the possible parameters that can exist in the exported config object:

* **handle** (string): The name osbot should take when it joins channels.
* **network** (string): The server osbot will connect to.
* **params** (object): Various parameters passed to `node-irc` when osbot is run, which can include:
  * **channels** (array): An array of channels osbot will join upon logging in to the server.
* **github** (object): Optional parameters to use with the `node-github` module, which is mostly used for filing issues with OSbot.
  * **user** (string): The Github user to log in as.
  * **email** (string): The email of the Github user to log in as.
  * **password** (string): The password of the Github user to log in as.
  * **repo** (string): The Github repository that you wish to file issues with.
  * **token** (string): The API token of the Github user you wish to log in as. If a token is included then `user`, `email`, and `password` are not required.

## Quick Help <a name="quickhelp"></a>

To get assistance with opensourcerybot, simply type the following in any channel it is running in:

```
!help
```

This will list all possible help topics.

```
!help [topic]
```

where `[topic]` is one of the topics listed in the previous will give more detailed information, including commands that topic may govern.

## Common Uses <a name="commonuses"></a>

Since the `!help` function isn't necessarily the best way to learn functions you'd want to use, here is a list of the most common uses of OSbot and how they may be best utilized. For explanations on why OSbot did something, skip down to [Common Questions](#commonquestions).

### Initial Stuff

OSbot is versatile in how you can talk to it! Saying any OSbot command in a channel OSbot occupies will provoke a public response from OSbot, while sending a private message to OSbot will ensure your communication will stay just between you.

For example, typing [`!help`](#quickhelp) inside of a public channel will have OSbot list all of the help functions for all to see. If you PMed that to OSbot, only you would see the responses.

### Karma (aka ++/--)

OSbot tracks karma by using common IRC karma commands. There are several easy ways to modify it:

| Command Format | Example                               | Explanation           |
|----------------|---------------------------------------|-----------------------|
| `[user]++`     | `jwaxo++`, `jwaxo++ for being awesome` | Adds karma to a user. |
| `[user]--`     | `jwaxo--`, `jwaxo-- for messing with OSbot again` | Removes karma from a user. |
| `[user][modification] [diceroll]` | `jwaxo++ d6 for adding dice` | Modifies a random amount of karma based on a die roll. |

Karma can be checked with `!karma [user]`, which will show the total karma, as well as how many up-votes and down-votes a user has received globally.

### Groups (aka @)

OSbot allows for quick-and-easy group communication with on-the-fly group creation and sending. It is easy to set up a new group, add or remove users, and, most importantly, have conversations with them.

The end outcome of @groups is that ad hoc chatrooms can be created on-the-fly, with users communicating via OSbot's private message box. Here is a quick rundown of the possible ways to use the Groups feature:

| Command Format | Example                               | Explanation           |
|----------------|---------------------------------------|-----------------------|
| `@[group] [message]`     | `@lunch Let's get lunch!` | Private messages all users in a group with your name attached as well as what group the message originated from. Users can then @group back from the PM window or a public location if they wish for it to be publicly known by users outside of the group. |
| `@all [message]` | `@all I love @groups!` | Private messages all users that have ever been added to a group. That's right: any user ever added to a group automatically gets added to @all. Users can be removed from @all like normal if they really don't want to receive @all communications. |
| `!groupadd [user] to [group]`     | `!groupadd jwaxo to lunch` | Adds a user to a group. If that group does not exist, it will be created, and the user will be automatically added to it. |
| `!groupremove [user] from [group]` | `!groupremove jwaxo from lunch` | Removes a user from a group. If that group is then empty, it will be deleted. |

By keeping the @group conversations inside a PM, channel static is cut down by a moderate amount, duplicate messages are prevented when OSbot then sends the message out, and all users in that group are pinged by their IRC client due to a PM instead of due to their name being read out in an exhaustive list.

### Tell (aka That Message Thing)

If a user is AFK/unresponsive/logged out, you can leave a message for them to receive the next time they either log on to or say something in the channel. The user will receive the message, the time it was left, and your username, all in a PM from OSbot. It's perfect for non-important messages while a user is on vacation, entranced in their work, or in a meeting.

***NOTE***: Even though !tell tries to remain as private as possible, sensitive information should not be shared this way. IRC is not the most secure of platforms, and it's extremely easy for a user to change their nickname, receive a user's stored tells, and change them back.

| Command Format | Example                               | Explanation           |
|----------------|---------------------------------------|-----------------------|
| `!tell [user] [message]`     | `!tell jwaxo OSbot is the best!` | Saves a message that will automatically be PMed to a user the next time they act responsive on a server; either when they log in or when they say something on the channel. |
| `!telllist [user]` | `!telllist jwaxo` | States how many tells a user has stored for them. Due to privacy concerns does not list the individual tells. |

## Common Questions <a name="commonquestions"></a>

A lot of questions come from OSbot's actions, but hopefully some of these questions/complaints/screams of anguish can be answered below. If you have a question that isn't answered here, ask it in the [OSbot Issues](https://github.com/opensourcery/opensourcerybot/issues) section of the repo and it will probably be added here.

### Why Doesn't OSbot Shut Up?

OSbot is meant to both be useful and entertaining, and it has several ways of communicating that entertainment. There are several things that OSbot will blab randomly about

| Typical Statement | Name of Function | Explanation |
|-------------------|------------------|-------------|
| `I don't have a skull. Or bones.` | Wisdom/Nuggets | OSbot has a chance of saying something from its `!wisdom` bank every time someone posts to the channel. The `!wisdom` bank is composed of random sayings or topics that users thought would be fun for OSbot to randomly say. Currently the only way to remove a nugget is to manually remove it from the JSON object that stores them. |
| `Are you sure?` | Comeback | OSbot will pull a random saying from its `!comeback` bank whenever another user posts something to the channel that includes OSbot's handle (see [configuration](#configuration)). These often take the form of sentences that could be part of a conversation--but often are just nonsense. |
| `Die Hard 2: Die Harder` | Dieharderer | When OSbot sees something in chat that could make a good and/or bad movie sequel title, they will say it. |
| `Snow? Did somebody say snow?` | Trigger | Specific triggers may be set up for OSbot that look for certain words and spit out canned responses. This function is still being improved and worked on. |
| `so irc`, `such wow` | Wow | Doge! Triggered by the word `wow` appearing in a chat message, OSbot will randomly state a saved `!wow` message. |