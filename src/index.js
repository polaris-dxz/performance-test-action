#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

const execSync = require('child_process').execSync;
const devCookies = require('./cookie.json')
const fs = require('fs');
const path = require('path');
const { print } = require('./helper')

const siteSpeedConfig = './config/sitespeed.json'
const websitePath = path.join(__dirname, './website.txt')

process.on('SIGINT', () => {
  process.kill(process.pid);
});

const getCookies = () => {
  let res = ''
  Object.entries(devCookies).forEach(e => {
    const [k, v] = e
    res += `--cookie ${k}="${v}" `
  })
  return res
};

const mkdir = (dir, to = './') => {
  if (!fs.existsSync(`./${dir}`)) {
    fs.mkdir(path.join(__dirname, to, dir), (err) => {
      if (err) {
        print.error(err)
      }
    })
  }
}

const checkFileExists = () => {
  const checkFiles = ['./cookie.json', siteSpeedConfig, './website.txt']
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

const runSiteSpeed = (websites, iterations, cookies) => {
  const configPath = path.join(__dirname, siteSpeedConfig)
  websites = websites.replace(',', ' ')
  websites = !!websites ? websites : websitePath
  const perf = `sitespeed.io ${cookies} --config ${configPath} ${websites} -n ${iterations} > ./logs/sitespeed.log`
  print.info(perf)
  try {
    execSync(perf)
    const result = execSync('tail -n -1 ./logs/sitespeed.log').toString()
    const resultPath = result.split('HTML stored in ')[1]
    print.success(`Execute Success! Report Address is:`)
    print.info(resultPath)
  } catch (error) {
    print.error(error)
  }
};

const runLighthouse = (websites, iterations) => {
  try {
    let websiteArr = websites.split(',')
    if (!websiteArr[0]) {
      const data = fs.readFileSync(websitePath, 'UTF-8');
      websiteArr = data.split(/\r?\n/);
    }
    // const configPath = path.join(__dirname, lighthouseConfig)
    const config = `--locale zh-CN --preset=desktop --chrome-flags="--headless"`
    mkdir('lighthouse-result', '../')
    for (let index = 0; index < iterations; index++) {
      websiteArr.forEach((website) => {
        const outputName = website.replace(/http[s]{0,1}\:\/\//, '').replace(/\//g, '_')
        if (outputName !== '') {
          const outputPath = path.join(__dirname, '../', `./lighthouse-result/${outputName}_${index}`)
          const output = `--output-path ${outputPath}.html` 
          const perf = `lighthouse ${website} ${config} ${output} > ./logs/lighthouse.log`
          execSync(perf)
        }
      });
    }
  } catch (error) {
    print.error(error)
  }
}

const runPerf = () => {
  const execScripts = process.argv[2] || ''
  
  if (!execScripts) {
    throw new Error('Please select your scripts')
  }
  mkdir('logs')

  const websites = process.argv[3] || ''
  const iterations = +(process.argv[4] || '1')
  const cookies = getCookies()
  
  if (/sitespeed|lighthouse/.test(execScripts)) {
    if (execScripts.includes('sitespeed')) {
      runSiteSpeed(websites, iterations, cookies)
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
