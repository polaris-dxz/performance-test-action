const print = {
  error: content => console.log("\033[31m%s\033[0m", content),
  warning: content => console.log( "\033[33m%s\033[0m", content),
  success: content => console.log("\033[32m%s\033[0m", content),
  info: content => console.log("\033[36m%s\033[0m", content)
}

module.exports = {
  print
}
