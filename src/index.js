const execSync = require('child_process').execSync;
const devCookies = require('./cookie.json')
const fs = require('fs');
const path = require('path');
const { print } = require('./helper')

const siteSpeedConfig = './config/sitespeed.json'
const lighthouseConfig = './config/lighthouse.config.js'
const websitePath = path.join(__dirname, './website.txt')

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
      print.error(`${filename} 不存在！`)
      flag = true
    }
  })
  if (flag) {
    process.exit(1);
  }
};

const runSiteSpeed = (websites, iterations) => {
  const cookieStr = getCookies()
  const configPath = path.join(__dirname, siteSpeedConfig)
  websites = websites.replace(',', ' ')
  websites = !!websites ? websites : websitePath
  const perf = `sitespeed.io ${cookieStr} --config ${configPath} ${websites} -n ${iterations} > ./logs/sitespeed.log`
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

const runLighthouse = (websites, iterations) => {
  print.warning('lighthouse 不支持传入 Cookie')
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
  } catch (err) {
      console.error(err);
  }
}

const runPerf = () => {
  const execScripts = process.argv[2] || ''
  
  if (!execScripts) {
    print.error('请选择要执行的脚本!')
    process.exit(1)
  }
  mkdir('logs')
  const websites = process.argv[3] || ''
  const iterations = +(process.argv[4] || '1')

  if (/sitespeed|lighthouse/.test(execScripts)) {
    if (execScripts.includes('sitespeed')) {
      runSiteSpeed(websites, iterations)
    }
  
    if (execScripts.includes('lighthouse')) {
      runLighthouse(websites, iterations)
    }
  } else {
    print.error('参数错误!')
    process.exit(1)
  }
}

const main = () => {
  checkFileExists()
  runPerf()
};

main();
