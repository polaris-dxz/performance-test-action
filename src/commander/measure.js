const path = require('path');
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
  }
  return res
};

const runSiteSpeed = ({websites, iterations, cookies}, verbose=false) => {
  shell.mkdir('-p', 'sitespeed-result', 'logs')
  const configPath = path.join(__dirname, siteSpeedConfig)
  websites = websites.replace(',', ' ')
  cookies = getCookies(cookies)
  const perf = `npx sitespeed.io ${cookies} --config ${configPath} ${websites} -n ${iterations} > ./logs/sitespeed.log`
  if (verbose) {
    print.info(perf)
  }
  try {
    const spinner = ora('🚗 开始性能测试...\n').start()
    shell.exec(perf)
    spinner.succeed('🚀 性能分析成功\n')
    const result = shell.exec('tail -n -1 ./logs/sitespeed.log').toString()
    const resultPath = result.split('HTML stored in ')[1]
    print.success(`Execute Success! Report Address is:`)
    print.info(resultPath)
  } catch (error) {
    print.error(error)
  }
};

const runLighthouse = ({websites, iterations, cookies, preset}, verbose=false) => {
  const spinner = ora('🚗 开始性能测试...\n').start()
  shell.mkdir('-p', 'lighthouse-result', 'logs')
  print.warning('lighthouse 不支持传入 Cookie')
  try {
    let websiteArr = websites.split(',')
    const config = `--locale zh-CN --preset=${preset} --chrome-flags="--headless"`
    for (let index = 0; index < iterations; index++) {
      websiteArr.forEach((website) => {
        const outputName = website.replace(/http[s]{0,1}\:\/\//, '').replace(/\//g, '_')
        if (outputName !== '') {
          const outputPath = path.join(__dirname, '../../', `./lighthouse-result/${outputName}_${index}`)
          const output = `--output-path ${outputPath}.html` 
          const perf = `npx lighthouse ${website} ${config} ${output} > ./logs/lighthouse.log`
          shell.exec(perf)
        }
      });
    }
    spinner.succeed('🚀 性能分析成功\n')
  } catch (error) {
    print.error(error)
  }
}

const runPerf = (config, verbose) => {
  let { websites, iterations, cookies, preset, sitespeed, lighthouse } = require(config)
  sitespeed = sitespeed || true
  lighthouse = lighthouse || false
  cookies = cookies || ''
  preset = preset || 'desktop'
  iterations = iterations || 5
  websites = websites.join(',') || ''

  if (websites) {
    if (sitespeed) {
      runSiteSpeed({websites, preset, iterations, cookies}, verbose)
    }
    if (lighthouse) {
      runLighthouse({websites, preset, iterations, cookies}, verbose)
    }
  } else {
    throw new Error('websites 参数不能为空！\n');
  }
}

module.exports = {
  runSiteSpeed,
  runLighthouse,
  runPerf
}

