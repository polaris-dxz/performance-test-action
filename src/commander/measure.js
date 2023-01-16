const path = require('path');
const { print } = require('../helper')
const shell = require('shelljs')

const siteSpeedConfig = '../config/sitespeed.json'

const getCookies = (cookies) => {
  const cookiesArr = cookies.replace(/[\"|"\']/g, '').replace(/\;/g, '/').split('/').filter(e => e)
  let res = ''
  if (cookiesArr.length > 0) {
    cookiesArr.forEach(cookie => {
      res += `--cookie ${cookie.trim()} `
    })
  }
  return res
};

const runSiteSpeed = ({websites, iterations, cookies}) => {
  shell.mkdir('-p', 'sitespeed-result', 'logs')
  const configPath = path.join(__dirname, siteSpeedConfig)
  websites = websites.replace(',', ' ')
  cookies = getCookies(cookies)
  const perf = `npx sitespeed.io ${cookies} --config ${configPath} ${websites} -n ${iterations} > ./logs/sitespeed.log`
  print.info(perf)
  try {
    shell.exec(perf)
    const result = shell.exec('tail -n -1 ./logs/sitespeed.log').toString()
    const resultPath = result.split('HTML stored in ')[1]
    print.success(`Execute Success! Report Address is:`)
    print.info(resultPath)
  } catch (error) {
    print.error(error)
  }
};

const runLighthouse = ({websites, iterations, cookies, preset}) => {
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
  } catch (error) {
    print.error(error)
  }
}

module.exports = {
  runSiteSpeed,
  runLighthouse
}

