exports.name = 'issue'

exports.weight = 10

exports.requires = [
  {
    name: 'github',
    file: 'github'
  }
]

exports.help = [
  {
    usage: '!issue "[topic]" "[body]"',
    description: 'Create a new issue on opensourcerybot with optional body text'
  }
]

exports.run = function (client, message, requires) {
  var Client = requires.github
    , issue = {
      user: client.config.github.user,
      repo: client.config.github.repo,
      labels: []
    }
  var github = new Client({
    version: "3.0.0"
  })

  github.authenticate({
    type: "oauth",
    token: client.config.github.token
  })

  var result = /^!issue\s+"(.*)"\s+"(.*)"$/.exec(message.content)
  if (result && result[1]) {
    issue.title = result[1]
    if (result[2]) {
      issue.body = result[2]
    }
    github.issues.create(issue, function(error, result) {
      if (error) {
        console.log('Issue error: ' + error)
        client.speak(message, 'Sorry, ' + message.from + '. github rejected that issue!')
      }
      else {
        console.log('Issue created: ' + result)
        client.speak(message, 'Thanks, ' + message.from + '. I know I have problems sometimes!')
      }
    })

    return {status:"success"}
  }

  return {status:"fail"}
}
