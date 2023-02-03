const path = require('path');
const fs = require('fs');
const { print } = require('../helper')
const shell = require('shelljs')
const ora = require('ora')

print.figlet('ONES Perf\n')

const siteSpeedConfig = '../config/sitespeed.json'

const getCookies = (cookies) => {
  // 兼容 github action secret 问题，cookie 不能用 ; 分割
  const cookiesArr = cookies.replace(/[\"|"\']/g, '').replace(/\;/g, '/').split('/').filter(e => e)
  let res = ''
  if (cookiesArr.length > 0) {
    cookiesArr.forEach(cookie => {
      res += `--cookie ${cookie.trim()} `
    })
    return res
  } else {
    print.error('The incoming cookie is in the wrong format')
    process.exit(1)
  }
  
};

const runSiteSpeed = ({websites, iterations, cookies}, verbose=false) => {
  shell.mkdir('-p', 'sitespeed-result', 'logs')
  const logPath = path.resolve('.', './logs/sitespeed.log')
  const configPath = path.join(__dirname, siteSpeedConfig)
  
  websites = websites.replace(',', ' ')
  cookies = getCookies(cookies)
  const perf = `npx sitespeed.io ${cookies} --config ${configPath} ${websites} -n ${iterations} > ./logs/sitespeed.log 2>&1`
  const spinner = ora('🚗 开始性能测试 [SiteSpeed.io]...\n').start()
  if (verbose) {
    print.info(perf)
  }
  try {
    shell.exec(perf)
    const result = shell.exec(`tail -n -1 ${logPath}`).toString()
    if (result.includes('Error')) {
      spinner.fail('🤖 性能分析失败\n')
      print.error(result)
      process.exit(1)
    } else {
      spinner.succeed('🚀 性能分析成功\n')
      const resultPath = result.split('HTML stored in ')[1].replace('\n', '')
      print.success(`Execute Success! SiteSpeed Report Address is:`, resultPath)
      print.info(`log is:`, logPath, '\n')
    }
  } catch (error) {
    print.error(error)
    process.exit(1)
  }
};

const runLighthouse = ({websites, iterations, cookies, preset}, verbose=false) => {
  const spinner = ora('🚗 开始性能测试 [Lighthouse]...\n').start()
  shell.mkdir('-p', 'lighthouse-result', 'logs')
  const logPath = path.resolve('.', './logs/lighthouse.log') 
  if (cookies) {
    print.warning('lighthouse 不支持传入 Cookie! 请使用 Whistle 开启本地代理传入 Cookie!')
  }

  try {
    let websiteArr = websites.split(',')
    const config = `--locale zh-CN --preset=${preset} --chrome-flags="--headless"`
    for (let index = 0; index < iterations; index++) {
      websiteArr.forEach((website) => {
        const outputName = website.replace(/http[s]{0,1}\:\/\//, '').replace(/\//g, '_')
        if (outputName !== '') {
          const outputPath = path.resolve('.', `./lighthouse-result/${outputName}_${index}`)
          const output = `--output-path ${outputPath}.html` 
          const perf = `npx lighthouse ${website} ${config} ${output} > ${logPath} 2>&1`
          shell.exec(perf)
        }
      });
    }
    spinner.succeed('🚀 性能分析成功\n')
    const resultPath = path.resolve('.', './lighthouse-result')
    print.success(`Execute Success! Lighthouse Report Address is:`,resultPath)
    print.info(`log is:`, logPath)
  } catch (error) {
    print.error(error)
    process.exit(1)
  }
}

// 执行带 config 的命令
const runPerf = (config, verbose) => {
  let { websitesPath, iterations, cookies, preset, sitespeed, lighthouse } = require(config)
  websitesPath = path.resolve('.', websitesPath)
  cookies = cookies || ''
  preset = preset || 'desktop'
  iterations = iterations || 5

  const data = fs.readFileSync(websitesPath, 'UTF-8')
  const lines = data.split(/\r?\n/).filter(e => e)
  const websites = lines.join(',').trim() || ''

  if (websites) {
    if (sitespeed) {
      runSiteSpeed({websites, preset, iterations, cookies}, verbose)
    }
    if (lighthouse) {
      runLighthouse({websites, preset, iterations, cookies}, verbose)
    }
  } else {
    print.error('websites 参数不能为空！\n');
    process.exit(1);
  }
}

module.exports = {
  runSiteSpeed,
  runLighthouse,
  runPerf
}

