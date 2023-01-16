#!/usr/bin/env node
const yargs = require('yargs/yargs');
const process = require('process');
const { hideBin } = require('yargs/helpers');
const { version } = require('../package.json')
const { runSiteSpeed, runLighthouse } = require('./commander/measure')
const { runBenchmark } = require('./commander/benchmark')

process.on('SIGINT', () => {
  process.kill(process.pid);
});

const argv = yargs(hideBin(process.argv))
  .strict()
  .command({
    command: 'measure',
    aliases: ['m'], 
    desc: '性能测量',
    builder: function (yargs) {
      return yargs
        .check((argv) => {
          if (argv.all) return true;
          if (typeof argv.websites !== 'string' || !argv.websites) {
            throw new Error('websites 参数不能为空！\n');
          }
          const typeErr = typeof argv.lighthouse !== 'boolean' || typeof argv.sitespeed !== 'boolean'
          const notCheckPerfTool = !argv.lighthouse && !argv.sitespeed
          if (typeErr || notCheckPerfTool) {
            throw new Error('请至少选择一个测试工具！\n');
          }
          return true;
        })
        .options({
          cookies: {
            alias: 'c',
            describe: '传入cookies',
            string: true, 
            default: ''
          },
          websites: {
            alias: 'w',
            describe: '测试网站，用","区分',
            string: true, 
          },
          preset: {
            alias: 'p',
            describe: '测试桌面端还是移动端',
            string: true,
            choices: ['desktop', 'mobile'],
            default: 'desktop' 
          },
          iterations: {
            alias: 'n',
            describe: '测试次数',
            number: true,
            default: 5
          },
          lighthouse: {
            alias: 'l',
            describe: '使用 lighthouse 测量页面性能',
            boolean: true,
            default: false
          },
          sitespeed: {
            alias: 's',
            describe: '使用 sitespeed.io 测量页面性能',
            boolean: true,
            default: true
          },
        })
        .usage('$0 measure -w <website>')
        .usage('$0 measure -w <website> -n 10')
        .example([
          ['$0 measure -w https://ones.com,https://ones,com/ja', '测试 ones.com 英文日文主站性能'],
          ['$0 measure -w https://dev.myones.net/web-ones-com/U0056 -c "a=b;c=d"', '测试 dev 环境性能，并传入 cookie'],
        ]);
    },
    handler: function (argv) {
      const {
        websites, preset, iterations, cookies, lighthouse, sitespeed
      } = argv;
      if (sitespeed) {
        runSiteSpeed({websites, preset, iterations, cookies})
      }
      if (lighthouse) {
        runLighthouse({websites, preset, iterations, cookies})
      }
    },
  })
  .command({
    command: 'benchmark',
    aliases: ['b'], 
    desc: 'benchmark',
    builder: function (yargs) {
      return yargs
        .check((argv) => {
          if (argv.all) return true;
          if (typeof argv.websites !== 'string' || !argv.websites) {
            throw new Error('websites 参数不能为空！\n');
          }
          return true;
        })
        .options({
          websites: {
            alias: 'w',
            describe: '测试网站，用","区分',
            string: true, 
          },
        })
        .usage('$0 benchmark -w <website>')
        .usage('$0 benchmark -w <website> -n 10')
        .example([
          ['$0 benchmark -w https://ones.com,https://ones,com/ja', '测试 ones.com 英文日文主站性能'],
        ]);
    },
    handler: function (argv) {
      const {
        websites
      } = argv;
      runBenchmark({ websites })
    },
  })
  .fail(function (msg, err, yargs) {
    console.error(yargs.help());
    console.error('\n', msg);
    process.exit(1);
  })
  .showHelpOnFail(false, '命令指定 --help 查看有效的选项')
  .version(version)
  .wrap(null)
  .help('help', '查看命令行帮助').argv;

module.exports = argv;
