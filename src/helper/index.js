const figlet = require('figlet')
const chalk = require('chalk')

const print = {
  error: (content, ...argv) => console.log(chalk.red(content), ...argv),
  warning: (content, ...argv) => console.log(chalk.yellow(content), ...argv),
  success: (content, ...argv) => console.log(chalk.green(content), ...argv),
  info: (content, ...argv) => console.log(chalk.cyan(content), ...argv),
  figlet: content => console.log(figlet.textSync(content)),
}

module.exports = {
  print
}
