const shell = require('shelljs')

const runBenchmark = ({ websites }) => {
  websites.split(',').forEach(website => {
    shell.exec(`npx autocannon ${website}`)
  })
}

module.exports = {
  runBenchmark
}