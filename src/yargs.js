const yargs = require('yargs/yargs');
const process = require('process');
const { hideBin } = require('yargs/helpers');
const path = require('path');

process.on('SIGINT', () => {
  process.kill(process.pid);
});

const argv = yargs(hideBin(process.argv))
  .strict()
  .command({
    command: 'measure',
    aliases: ['m'], // 子命令别名
    desc: '测量文件', // 子命令描述
    builder: function (yargs) {
      // 此处返回命令参数组合
      return yargs
        .check((argv) => {
          // .check支持手动校验接受的参数
          if (argv.all) return true;
          if (typeof argv.sourceFile !== 'string' || !argv.sourceFile) {
            throw new Error('CLI出错啦，源文件路径必须是字符串且不能为空！\n');
          }
          return true;
        })
        .options({
          // 子命令参数
          sourceFile: {
            alias: 'path', // 子命令参数别名
            describe: '测量路径', // 子命令参数描述
            string: true, // 接受类型是字符串
          },
          recursive: {
            alias: 'r',
            describe: '递归查找文件,一般用于测试整个模块使用',
            boolean: true, // 接受类型是布尔值，默认会隐形转换
          },
          docker: {
            alias: 'd',
            describe: '该参数启用的话，测量是基于docker运行【无头浏览器运行】，数据包含视频录制',
            boolean: false,
          },
          open: {
            alias: 'o',
            describe: '该参数启用的话，会尝试调用本地浏览器打开测量后的数据网页',
            boolean: false,
          },
          'allow-ignore': {
            alias: 'keep',
            describe: '该参数启用的话，忽略文件机制会生效',
            boolean: true,
            default: true,
          },
          'all-module': {
            alias: 'all',
            describe: '该参数启用的话，会依次执行所有模块，最终输出所有模块报告',
            boolean: false,
          },
          'result-dir-name': {
            describe: '该参数可以把报告数据源的归纳到[resultDirName参数]目录，一般结合all参数使用',
            string: '',
          },
          number: {
            alias: 'n',
            describe: '配置测试走几轮，精度会高一些，但是每轮测试的时长会增加',
            number: true,
            default: 1,
          },
        })
        .usage('$0 measure <path>') // 辅助指南，终端输出的可以看到
        .usage('$0 measure [--path=<path>] [--docker=<true|false>]')
        .example([
          // 辅助指南，终端输出的可以看到
          ['$0 measure  "src/pages/desk/measures.js"', '测试该测量文件'],
          ['$0 m src/pages/desk/measures.js -r', '测试该测量文件及下层文件【递归往下找】'],
          ['$0 m src/pages/project/components/sprint/plan/measure.js --allow-ignore=false', '强行测量处于忽略清单的文件'],
        ]);
    },
    handler: function (argv) {
      // 响应句柄，这里处理参数通过校验后接收到的对象，然后你自己丢到你自己实现的功能函数引用即可！
      // 支持async await , promise这类异步调用
      if (argv.all) {
        console.log(1)
      } else {
        const entryPath = path.resolve(process.cwd(), argv?.sourceFile);
        const arg = {
          sourceFile: entryPath,
          r: argv?.r ?? false,
          n: argv?.n,
          d: argv?.d,
          open: argv?.o,
          docker: argv?.docker,
          allowIgnore: argv?.keep,
          resultDirName: argv?.resultDirName,
        };
        console.log(arg)
      }
    },
  })
  .fail(function (msg, err, yargs) {
    console.error(yargs.help());
    console.error('\n', msg);
    process.exit(1);
  })
  .showHelpOnFail(false, '命令指定 --help 查看有效的选项')
  .version(true)
  .wrap(null)
  .help('help', '查看命令行帮助').argv;

module.exports = argv;
