## 如何在本仓库跑性能报告
在你的仓库下新建两个 Secrets：COOKIES 和 WECHAT_HOOKS （区分大小写）
填入你需要传入的 Cookie（仅支持 SiteSpeed）和需要通知企微 bot 的 hooks 地址

COOKIES Value 格式如下：`a=b/c=d/e=f`

## 如何在自己的仓库使用 Github Action 跑性能报告

参考 [test.yml](./.github/workflows/test.yml)

## 如何使用 cli 工具跑性能报告

全局安装：
```shell
npm i -g ones-perf
```

工具使用：
```shell
perf [命令]

命令：
  perf measure    性能测量  [aliases: m]
  perf benchmark  benchmark  [aliases: b]

选项：
  --version  显示版本号  [布尔]
  --help     查看命令行帮助  [布尔]
```

性能测量：
命令行支持两种模式：
- 传入 config.json 
- 传入其他参数
注意：两种模式并不兼容

```shell
perf measure --config <config path>
perf measure -w <website>
perf measure -w <website> -n 10

选项：
      --version     显示版本号  [布尔]
      --help        查看命令行帮助  [布尔]
  -C, --config      读取 config 配置文件  [字符串] [默认值: ""]
  -c, --cookies     传入cookies  [字符串] [默认值: ""]
  -w, --websites    测试网站，用","区分  [字符串]
  -p, --preset      测试桌面端还是移动端  [字符串] [可选值: "desktop", "mobile"] [默认值: "desktop"]
  -n, --iterations  测试次数  [数字] [默认值: 5]
  -l, --lighthouse  使用 lighthouse 测量页面性能  [布尔] [默认值: false]
  -s, --sitespeed   使用 sitespeed.io 测量页面性能  [布尔] [默认值: true]
  -v, --verbose     使用显示打印日志  [布尔] [默认值: false]

示例：
  perf measure --config ./config.json                                     通过 config 文件执行测试
  perf measure -w https://ones.com,https://ones,com/ja                    测试 ones.com 英文日文主站性能
  perf measure -w https://dev.myones.net/web-ones-com/U0056 -c "a=b;c=d"  测试 dev 环境性能，并传入 cookie
```

example.config.json
```json
{
  "iterations": 5,
  "websitesPath": "./websites.txt",
  "cookies": "a=b;c=d;e=f",
  "sitespeed": true,
  "lighthouse": false,
  "verbose": false
}
```

websites.txt
```txt
https://ones.com
https://ones.com/ja
```