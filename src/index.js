const execSync = require('child_process').execSync;
const devCookies = require('./cookie.json')
const fs = require('fs');
const path = require('path');
const { print } = require('../helper')

const getCookies = () => {
  let res = ''
  Object.entries(devCookies).forEach(e => {
    const [k, v] = e
    res += `--cookie ${k}="${v}" `
  })
  return res
};

const checkFileExists = () => {
  const checkFiles = ['./cookie.json', './config.json', './website.txt']
  let flag = false
  checkFiles.forEach(filename => {
    if (!fs.existsSync(path.join(__dirname, filename))) {
      print.error(`${filename} 不存在！`)
      flag = true
    }
  })
  if (flag) {
    process.exit(1);
  }
};

const runPerf = () => {
  const cookieStr = getCookies()
  const configPath = path.join(__dirname, './config.json')
  const websitePath = path.join(__dirname, './website.txt')
  const perf = `sitespeed.io ${cookieStr} --config ${configPath} ${websitePath} > ./logs/sitespeed.log`
  print.info(perf)
  try {
    execSync(perf)
    const result = execSync('tail -n -1 ./logs/sitespeed.log').toString()
    const resultPath = result.split('HTML stored in ')[1]
    print.success(`执行成功！报告地址：`)
    print.info(resultPath)
  } catch (error) {
    print.error(error)
  }
};

const main = () => {
  checkFileExists()
  runPerf()
};

main();
