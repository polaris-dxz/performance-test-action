const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const { print } = require('./helper')

const siteSpeedConfig = './config/sitespeed.json'

const checkFileExists = () => {
  const checkFiles = [siteSpeedConfig]
  let flag = false
  checkFiles.forEach(filename => {
    if (!fs.existsSync(path.join(__dirname, filename))) {
      print.error(`${filename} don't exist!`)
      flag = true
    }
  })
  if (flag) {
    process.exit(1);
  }
};

const runPerf = () => {
  const execScripts = process.argv[2] || ''
  
  if (!execScripts) {
    throw new Error('Please select your scripts')
  }
  mkdir('logs')

  const websites = process.argv[3] || ''
  const iterations = +(process.argv[4] || '1')
  const cookies = process.argv[5] || ''

  console.log('cookies', cookies)

  if (/sitespeed|lighthouse/.test(execScripts)) {
    if (execScripts.includes('sitespeed')) {
      runSiteSpeed(websites, iterations, getCookies(cookies))
    }
  
    if (execScripts.includes('lighthouse')) {
      runLighthouse(websites, iterations)
    }
  } else {
    throw new Error('Parameter Error')
  }
}

const main = () => {
  checkFileExists()
  runPerf()
};

main();
